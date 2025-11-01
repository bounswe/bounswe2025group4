package org.bounswe.jobboardbackend.workplace.service;

import com.google.cloud.storage.*;
import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.workplace.dto.*;
import org.bounswe.jobboardbackend.workplace.model.Workplace;
import org.bounswe.jobboardbackend.workplace.model.EmployerWorkplace;
import org.bounswe.jobboardbackend.workplace.model.enums.EthicalPolicy;
import org.bounswe.jobboardbackend.workplace.model.enums.EmployerRole;
import org.bounswe.jobboardbackend.workplace.repository.*;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.model.Role;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URL;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkplaceService {

    private final WorkplaceRepository workplaceRepository;
    private final EmployerWorkplaceRepository employerWorkplaceRepository;
    private final ReviewRepository reviewRepository;
    private final ReviewPolicyRatingRepository reviewPolicyRatingRepository;
    private final UserRepository userRepository;

    // === GCS config ===
    @Value("${app.gcs.bucket:bounswe-jobboard}")
    private String gcsBucket;

    @Value("${app.gcs.public:true}")
    private boolean gcsPublic;

    @Value("${app.gcs.publicBaseUrl:https://storage.googleapis.com}")
    private String gcsPublicBaseUrl;

    @Value("${app.env}")
    private String appEnv;

    // Google Cloud Storage client
    private final Storage storage = StorageOptions.getDefaultInstance().getService();

    // =========================
    // IMAGE (GCS integration)
    // =========================

    private String buildObjectNameForWorkplace(Long workplaceId, String originalFilename) {
        String ext = (originalFilename != null && originalFilename.contains("."))
                ? originalFilename.substring(originalFilename.lastIndexOf('.'))
                : ".jpg";
        return appEnv + "/" + "workplaces/" + workplaceId + ext;
    }

    private String publicUrl(String objectName) {
        return gcsPublicBaseUrl + "/" + gcsBucket + "/" + objectName;
    }

    private String extractObjectNameFromUrl(String url) {
        String prefix = gcsPublicBaseUrl + "/" + gcsBucket + "/";
        if (url != null && url.startsWith(prefix)) {
            return url.substring(prefix.length());
        }
        return null;
    }

    private String uploadToGcs(byte[] content, String contentType, String objectName) {
        BlobInfo info = BlobInfo.newBuilder(gcsBucket, objectName)
                .setContentType(contentType != null ? contentType : "application/octet-stream")
                .build();
        storage.create(info, content);
        if (gcsPublic) {
            return publicUrl(objectName);
        } else {
            URL signed = storage.signUrl(
                    BlobInfo.newBuilder(gcsBucket, objectName).build(),
                    15, TimeUnit.MINUTES,
                    Storage.SignUrlOption.withV4Signature(),
                    Storage.SignUrlOption.httpMethod(HttpMethod.GET)
            );
            return signed.toString();
        }
    }

    private void deleteFromGcs(String objectName) {
        if (objectName == null) return;
        try {
            storage.delete(gcsBucket, objectName);
        } catch (StorageException ignore) {
        }
    }

    @Transactional
    public WorkplaceImageResponseDto uploadImage(Long workplaceId, MultipartFile file, Long userId) {
        if (file == null || file.isEmpty()) {
            throw new HandleException(ErrorCode.IMAGE_FILE_REQUIRED, "Image file is required");
        }
        String ct = file.getContentType();
        if (ct == null || !ct.startsWith("image/")) {
            throw new HandleException(ErrorCode.IMAGE_CONTENT_TYPE_INVALID, "Only image files are allowed");
        }

        Workplace w = workplaceRepository.findById(workplaceId)
                .orElseThrow(() -> new HandleException(ErrorCode.WORKPLACE_NOT_FOUND, "Workplace not found"));
        assertEmployer(workplaceId, userId);

        if (w.getImageUrl() != null) {
            String oldObject = extractObjectNameFromUrl(w.getImageUrl());
            if (oldObject != null) {
                deleteFromGcs(oldObject);
            }
        }

        String objectName = buildObjectNameForWorkplace(workplaceId, file.getOriginalFilename());
        String url;
        try {
            url = uploadToGcs(file.getBytes(), ct, objectName);
        } catch (IOException e) {
            throw new HandleException(ErrorCode.IMAGE_UPLOAD_FAILED, "Upload failed", e);
        }

        w.setImageUrl(url);

        return WorkplaceImageResponseDto.builder()
                .imageUrl(url)
                .updatedAt(Instant.now())
                .build();
    }

    @Transactional
    public void deleteImage(Long workplaceId, Long userId) {
        Workplace w = workplaceRepository.findById(workplaceId)
                .orElseThrow(() -> new HandleException(ErrorCode.WORKPLACE_NOT_FOUND, "Workplace not found"));
        assertEmployer(workplaceId, userId);

        if (w.getImageUrl() != null) {
            String objectName = extractObjectNameFromUrl(w.getImageUrl());
            if (objectName != null) {
                deleteFromGcs(objectName);
            }
            w.setImageUrl(null);
        }
    }

    // === CREATE ===
    @Transactional
    public WorkplaceDetailResponse create(WorkplaceCreateRequest req, User currentUser) {
        currentUser = userRepository.findById(currentUser.getId()).orElseThrow(() -> new NoSuchElementException("User not found"));
        if (!isEmployer(currentUser)) throw new AccessDeniedException("Employer role required");
        Workplace wp = Workplace.builder()
                .companyName(req.getCompanyName())
                .sector(req.getSector())
                .location(req.getLocation())
                .shortDescription(req.getShortDescription())
                .detailedDescription(req.getDetailedDescription())
                .website(req.getWebsite())
                //.photoUrl(req.getPhotoUrl())
                .ethicalTags(req.getEthicalTags() == null ? new HashSet<>() : req.getEthicalTags().stream().map(EthicalPolicy::valueOf).collect(Collectors.toSet()))
                .deleted(false)
                .build();

        wp = workplaceRepository.save(wp);

        // Oluşturan employerı OWNER olarak ekliyoruz bazen farklı yetkiler vermek için
        EmployerWorkplace ew = EmployerWorkplace.builder()
                .workplace(wp)
                .user(currentUser)
                .role(EmployerRole.OWNER)
                .build();
        employerWorkplaceRepository.save(ew);

        return toDetailResponse(wp, /*includeReviews*/ false, /*reviewsLimit*/ 0);
    }

    // === LIST (brief) ===
    @Transactional(readOnly = true)
    public PaginatedResponse<WorkplaceBriefResponse> listBrief(
            int page, int size, String sector, String location,
            String ethicalTag, Double minRating, String sortBy, String search) {

        Pageable pageable = buildSort(page, size, sortBy);

        Page<Workplace> pageRes;
        if (search != null && !search.isBlank()) {
            pageRes = workplaceRepository.findByDeletedFalseAndCompanyNameContainingIgnoreCase(search, pageable);
        } else if (sector != null && !sector.isBlank()) {
            pageRes = workplaceRepository.findByDeletedFalseAndSectorIgnoreCase(sector, pageable);
        } else if (location != null && !location.isBlank()) {
            pageRes = workplaceRepository.findByDeletedFalseAndLocationIgnoreCase(location, pageable);
        } else {
            pageRes = workplaceRepository.findByDeletedFalse(pageable);
        }

        List<WorkplaceBriefResponse> items = pageRes.getContent().stream()
                .map(this::toBriefResponse)
                .filter(wb -> ethicalTag == null || (wb.getEthicalTags() != null && wb.getEthicalTags().contains(ethicalTag)))
                .filter(wb -> minRating == null || (wb.getOverallAvg() != null && wb.getOverallAvg() >= minRating))
                .collect(Collectors.toList());

        return PaginatedResponse.of(items, pageRes.getNumber(), pageRes.getSize(), pageRes.getTotalElements());
    }

    // === DETAIL ===
    @Transactional(readOnly = true)
    public WorkplaceDetailResponse getDetail(Long id, boolean includeReviews, int reviewsLimit) {
        Workplace wp = workplaceRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Workplace not found"));
        return toDetailResponse(wp, includeReviews, reviewsLimit);
    }

    // === UPDATE ===
    @Transactional
    public WorkplaceDetailResponse update(Long id, WorkplaceUpdateRequest req, User currentUser) {
        Workplace wp = workplaceRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Workplace not found"));

        assertEmployer(id, currentUser.getId());
        // TODO: bu şirkette employer olan herkes yapabiliyor bu işi, eğer sadece iş yerini oluşturan kişi yapabilsen dersek değiştiririz

        if (req.getCompanyName() != null) wp.setCompanyName(req.getCompanyName());
        if (req.getSector() != null) wp.setSector(req.getSector());
        if (req.getLocation() != null) wp.setLocation(req.getLocation());
        if (req.getShortDescription() != null) wp.setShortDescription(req.getShortDescription());
        if (req.getDetailedDescription() != null) wp.setDetailedDescription(req.getDetailedDescription());
        if (req.getWebsite() != null) wp.setWebsite(req.getWebsite());
        if (req.getEthicalTags() != null) {wp.setEthicalTags(req.getEthicalTags().stream().map(EthicalPolicy::valueOf).collect(Collectors.toSet()));}
        //if (req.getPhotoUrl() != null) wp.setImageUrl(req.getPhotoUrl());

        workplaceRepository.save(wp);
        return toDetailResponse(wp, false, 0);
    }

    // === only ratings ===
    @Transactional
    public WorkplaceRatingResponse getRating(Long workplaceId) {
        Workplace wp = workplaceRepository.findById(workplaceId)
                .orElseThrow(() -> new NoSuchElementException("Workplace not found"));
        Double avg = oneDecimal(calcAvgRating(wp.getId()));
        Map<String, Double> policyAvg = reviewPolicyRatingRepository.averageByPolicyForWorkplace(wp.getId())
                .stream()
                .collect(Collectors.toMap(
                        row -> String.valueOf(row[0]),
                        row -> oneDecimal(row[1] == null ? null : ((Number) row[1]).doubleValue())
                ));
        return WorkplaceRatingResponse.builder()
                .workplaceId(wp.getId())
                .overallAvg(avg)
                .ethicalAverages(policyAvg)
                .build();
    }

    // === DELETE (soft) ===
    @Transactional
    public void softDelete(Long id, User currentUser) {
        Workplace wp = workplaceRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Workplace not found"));
        assertOwner(id, currentUser.getId());
        wp.setDeleted(true);
        workplaceRepository.save(wp);
    }

    // === Helpers ===
    private Pageable buildSort(int page, int size, String sortBy) {
        if (sortBy == null || sortBy.isBlank()) {
            return PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "companyName"));
        }
        return switch (sortBy) {
            case "nameDesc" -> PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "companyName"));
            case "reviewCount" ->
                    PageRequest.of(page, size); // reviewCount’ı repo seviyesinde sıralamak istersen JPQL yazılır
            case "rating" -> PageRequest.of(page, size);      // avg rating sıralaması için custom query gerekir
            default -> PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "companyName"));
        };
    }

    public WorkplaceBriefResponse toBriefResponse(Workplace wp) {
        Double avg = oneDecimal(calcAvgRating(wp.getId()));
        Map<String, Double> policyAvg = reviewPolicyRatingRepository.averageByPolicyForWorkplace(wp.getId())
                .stream()
                .collect(Collectors.toMap(
                        row -> String.valueOf(row[0]),
                        row -> oneDecimal(row[1] == null ? null : ((Number) row[1]).doubleValue())
                ));
        return WorkplaceBriefResponse.builder()
                .id(wp.getId())
                .companyName(wp.getCompanyName())
                .imageUrl(wp.getImageUrl())
                .sector(wp.getSector())
                .location(wp.getLocation())
                .shortDescription(wp.getShortDescription())
                .ethicalTags(wp.getEthicalTags() == null ? List.of() : wp.getEthicalTags().stream().map(Enum::name).collect(Collectors.toList()))
                .ethicalAverages(policyAvg)
                .overallAvg(avg)
                .build();
    }

    private WorkplaceDetailResponse toDetailResponse(Workplace wp, boolean includeReviews, int reviewsLimit) {
        Double avg = oneDecimal(calcAvgRating(wp.getId()));
        Map<String, Double> policyAvg = reviewPolicyRatingRepository.averageByPolicyForWorkplace(wp.getId())
                .stream()
                .collect(Collectors.toMap(
                        row -> String.valueOf(row[0]),
                        row -> oneDecimal(row[1] == null ? null : ((Number) row[1]).doubleValue())
                ));

        List<EmployerListItem> employers = employerWorkplaceRepository.findByWorkplace_Id(wp.getId())
                .stream()
                .map(ew -> EmployerListItem.builder()
                        .userId(ew.getUser().getId())
                        .username(ew.getUser().getUsername())
                        .email(ew.getUser().getEmail())
                        .role(ew.getRole() != null ? ew.getRole().name() : null)
                        .joinedAt(ew.getCreatedAt())
                        .build())
                .toList();

        List<ReviewResponse> reviews = List.of();
        if (includeReviews) {
            Page<org.bounswe.jobboardbackend.workplace.model.Review> page = reviewRepository.findByWorkplace_Id(
                    wp.getId(), PageRequest.of(0, Math.max(1, reviewsLimit == 0 ? 3 : reviewsLimit))
            );
            reviews = page.getContent().stream().map(r -> ReviewResponse.builder()
                    .id(r.getId())
                    .workplaceId(wp.getId())
                    .userId(r.getUser().getId())
                    .title(r.getTitle())
                    .content(r.getContent())
                    .overallRating(r.getOverallRating())
                    .anonymous(r.isAnonymous())
                    .helpfulCount(r.getHelpfulCount())
                    .createdAt(r.getCreatedAt())
                    .updatedAt(r.getUpdatedAt())
                    // ethicalPolicyRatings ve reply doldurması service’inde ileride yapılacak
                    .build()).toList();
        }

        return WorkplaceDetailResponse.builder()
                .id(wp.getId())
                .companyName(wp.getCompanyName())
                .imageUrl(wp.getImageUrl())
                .sector(wp.getSector())
                .location(wp.getLocation())
                .shortDescription(wp.getShortDescription())
                .detailedDescription(wp.getDetailedDescription())
                .website(wp.getWebsite())
                .ethicalTags(wp.getEthicalTags() == null ? List.of() : wp.getEthicalTags().stream().map(Enum::name).collect(Collectors.toList()))
                .overallAvg(avg)
                .ethicalAverages(policyAvg)
                .recentReviews(reviews)
                .employers(employers)
                .createdAt(wp.getCreatedAt())
                .updatedAt(wp.getUpdatedAt())
                .build();
    }

    private Double calcAvgRating(Long workplaceId) {
        return reviewRepository.averageOverallByWorkplaceUsingPolicies(workplaceId);
    }

    private static Double oneDecimal(Double x) {
        if (x == null) return null;
        return Math.round(x * 10.0) / 10.0;
    }

    private void assertEmployer(Long workplaceId, Long userId) {
        boolean ok = employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(workplaceId, userId);
        if (!ok) throw new AccessDeniedException("Not an employer of this workplace");
    }
    private void assertOwner(Long workplaceId, Long userId) {
        boolean ok = employerWorkplaceRepository.existsByWorkplace_IdAndUser_IdAndRole(
                workplaceId, userId, EmployerRole.OWNER);
        if (!ok) throw new AccessDeniedException("Not the owner of this workplace");
    }

    private boolean isEmployer(User u) {
        return Role.ROLE_EMPLOYER.equals(u.getRole());
    }

}