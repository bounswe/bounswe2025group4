package org.bounswe.jobboardbackend.mentorship.repository;

import org.bounswe.jobboardbackend.auth.model.Role;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.mentorship.dto.MentorshipDetailsDTO;
import org.bounswe.jobboardbackend.mentorship.model.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class MentorshipRepositoriesTest {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private MentorProfileRepository mentorProfileRepository;

    @Autowired
    private MentorshipRequestRepository mentorshipRequestRepository;

//    @Autowired
//    private MessageRepository messageRepository; //it will be added in Milestone3

    @Autowired
    private ResumeReviewRepository resumeReviewRepository;

    @Autowired
    private TestEntityManager entityManager;

    // ---------------------------------------------------------------------
    // Helper: build minimal domain graph for mentor/mentee + request + review
    // ---------------------------------------------------------------------

    private static User buildUser(String username) {
        User u = new User();
        u.setUsername(username);
        u.setPassword("DefaultPassword123");
        u.setEmail(username + "@example.com");
        u.setRole(Role.ROLE_EMPLOYER);
        return u;
    }

    private MentorProfile buildAndPersistMentorProfile(User mentorUser) {
        MentorProfile profile = new MentorProfile();
        profile.setUser(mentorUser);
        profile.setExpertise(List.of("Java"));
        profile.setCurrentMentees(0);
        profile.setMaxMentees(5);
        profile.setAverageRating(0.0f);
        profile.setReviewCount(0);

        entityManager.persist(mentorUser);
        entityManager.persist(profile);
        return profile;
    }

    private MentorshipRequest buildAndPersistMentorshipRequest(MentorProfile mentor, User mentee) {
        MentorshipRequest request = new MentorshipRequest();
        request.setMentor(mentor);
        request.setRequester(mentee);
        request.setStatus(RequestStatus.PENDING);
        request.setCreatedAt(LocalDateTime.now());
        request.setMotivation("Test motivation");

        entityManager.persist(mentee);
        entityManager.persist(request);
        return request;
    }


    private ResumeReview buildAndPersistResumeReview(MentorshipRequest request,
                                                     MentorProfile mentor,
                                                     User mentee) {
        ResumeReview review = new ResumeReview();
        review.setMentor(mentor);
        review.setJobSeeker(mentee);
        review.setMentorshipRequest(request);
        review.setStatus(ReviewStatus.ACTIVE);
        review.setCreatedAt(LocalDateTime.now());

        entityManager.persist(review);
        return review;
    }

    // ---------------------------------------------------------------------
    // ConversationRepository
    // ---------------------------------------------------------------------

    @Test
    void conversationRepository_findByResumeReviewId_returnsConversation() {
        User mentorUser = buildUser("mentor");
        User mentee = buildUser("mentee");
        MentorProfile mentor = buildAndPersistMentorProfile(mentorUser);
        MentorshipRequest request = buildAndPersistMentorshipRequest(mentor, mentee);
        ResumeReview review = buildAndPersistResumeReview(request, mentor, mentee);

        Conversation conversation = new Conversation();
        conversation.setResumeReview(review);
        entityManager.persist(conversation);

        entityManager.flush();
        entityManager.clear();

        Optional<Conversation> found =
                conversationRepository.findByResumeReviewId(review.getId());

        assertTrue(found.isPresent());
        assertEquals(review.getId(), found.get().getResumeReview().getId());
    }

    // ---------------------------------------------------------------------
    // MentorProfileRepository
    // ---------------------------------------------------------------------

    @Test
    void mentorProfileRepository_findAllWithReviews_fetchesReviews() {
        User mentorUser = buildUser("mentor2");
        MentorProfile mentor = buildAndPersistMentorProfile(mentorUser);

        MentorReview review = new MentorReview();
        review.setMentor(mentor);
        review.setRating(5);
        review.setComment("Great mentor");
        review.setCreatedAt(LocalDateTime.now());

        entityManager.persist(review);
        entityManager.flush();
        entityManager.clear();

        List<MentorProfile> result = mentorProfileRepository.findAllWithReviews();

        assertFalse(result.isEmpty());

        MentorProfile loaded =
                result.stream()
                        .filter(m -> m.getId().equals(mentor.getId()))
                        .findFirst()
                        .orElseThrow();

        assertNotNull(loaded.getMentorReviews());
        assertEquals(1, loaded.getMentorReviews().size());
    }

    // ---------------------------------------------------------------------
    // MentorshipRequestRepository
    // ---------------------------------------------------------------------

    @Test
    void mentorshipRequestRepository_findByMentorId_returnsRequests() {
        User mentorUser = buildUser("mentor3");
        User mentee = buildUser("mentee3");
        MentorProfile mentor = buildAndPersistMentorProfile(mentorUser);
        MentorshipRequest request = buildAndPersistMentorshipRequest(mentor, mentee);

        entityManager.flush();
        entityManager.clear();

        List<MentorshipRequest> result =
                mentorshipRequestRepository.findByMentorId(mentor.getId());

        assertEquals(1, result.size());
        assertEquals(request.getId(), result.getFirst().getId());
    }

    @Test
    void mentorshipRequestRepository_findAllMentorshipDetailsByMenteeId_returnsAggregatedDtos() {
        User mentorUser = buildUser("mentor4");
        User mentee = buildUser("mentee4");
        MentorProfile mentor = buildAndPersistMentorProfile(mentorUser);
        MentorshipRequest request = buildAndPersistMentorshipRequest(mentor, mentee);
        ResumeReview review = buildAndPersistResumeReview(request, mentor, mentee);

        Conversation conversation = new Conversation();
        conversation.setResumeReview(review);
        entityManager.persist(conversation);

        entityManager.flush();
        entityManager.clear();

        List<MentorshipDetailsDTO> dtos =
                mentorshipRequestRepository.findAllMentorshipDetailsByMenteeId(mentee.getId());

        assertEquals(1, dtos.size());

    }

    @Test
    void mentorshipRequestRepository_countByStatus_returnsCorrectCount() {
        User mentorUser = buildUser("mentor5");
        User mentee = buildUser("mentee5");
        MentorProfile mentor = buildAndPersistMentorProfile(mentorUser);

        buildAndPersistMentorshipRequest(mentor, mentee); // PENDING
        buildAndPersistMentorshipRequest(mentor, mentee); // PENDING

        entityManager.flush();
        entityManager.clear();

        long pendingCount =
                mentorshipRequestRepository.countByStatus(RequestStatus.PENDING);

        assertEquals(2L, pendingCount);
    }

    // ---------------------------------------------------------------------
    // MessageRepository (it will be added in Milestone3)
    // ---------------------------------------------------------------------

//    @Test
//    void messageRepository_findByConversationIdOrderByTimestampAsc_returnsOrderedMessages() {
//        User mentorUser = buildUser("mentor6");
//        User mentee = buildUser("mentee6");
//        MentorProfile mentor = buildAndPersistMentorProfile(mentorUser);
//        MentorshipRequest request = buildAndPersistMentorshipRequest(mentor, mentee);
//        ResumeReview review = buildAndPersistResumeReview(request, mentor, mentee);
//
//        Conversation conversation = new Conversation();
//        conversation.setResumeReview(review);
//        entityManager.persist(conversation);
//
//        LocalDateTime now = LocalDateTime.now();
//
//        Message m2 = new Message();
//        m2.setConversation(conversation);
//        m2.setContent("second");
//        m2.setTimestamp(now.plusMinutes(1));
//        entityManager.persist(m2);
//
//        Message m1 = new Message();
//        m1.setConversation(conversation);
//        m1.setContent("first");
//        m1.setTimestamp(now);
//        entityManager.persist(m1);
//
//        entityManager.flush();
//        entityManager.clear();
//
//        List<Message> messages =
//                messageRepository.findByConversationIdOrderByTimestampAsc(conversation.getId());
//
//        assertEquals(2, messages.size());
//        assertEquals("first", messages.get(0).getContent());
//        assertEquals("second", messages.get(1).getContent());
//    }

    // ---------------------------------------------------------------------
    // ResumeReviewRepository
    // ---------------------------------------------------------------------

    @Test
    void resumeReviewRepository_findByConversationId_returnsReview() {
        User mentorUser = buildUser("mentor7");
        User mentee = buildUser("mentee7");
        MentorProfile mentor = buildAndPersistMentorProfile(mentorUser);
        MentorshipRequest request = buildAndPersistMentorshipRequest(mentor, mentee);
        ResumeReview review = buildAndPersistResumeReview(request, mentor, mentee);

        Conversation conversation = new Conversation();
        conversation.setResumeReview(review);
        entityManager.persist(conversation);

        review.setConversation(conversation);
        entityManager.persist(review);

        entityManager.flush();
        entityManager.clear();

        Optional<ResumeReview> found =
                resumeReviewRepository.findByConversationId(conversation.getId());

        assertTrue(found.isPresent());
        assertEquals(conversation.getId(), found.get().getConversation().getId());
    }
}
