package org.bounswe.backend.tag.service;

import org.bounswe.backend.tag.entity.Tag;
import org.bounswe.backend.tag.repository.TagRepository;
import org.bounswe.backend.tag.exception.TagException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
public class TagService {

    private final TagRepository tagRepository;

    public TagService(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    public List<String> getAllTagNames() {
        return tagRepository.findAll()
                .stream()
                .map(Tag::getName)
                .sorted()
                .collect(Collectors.toList());
    }

    public Tag findOrCreateTag(String tagName) {
        if (tagName == null || tagName.trim().isEmpty()) {
            throw new TagException("Tag name cannot be empty", "TAG_NAME_REQUIRED");
        }

        String normalizedTagName = tagName.trim().toUpperCase();

        // Check if tag exists (case-insensitive)
        Optional<Tag> existingTag = tagRepository.findByNameIgnoreCase(normalizedTagName);

        if (existingTag.isPresent()) {
            return existingTag.get();
        }

        // Create new tag if not exists
        Tag newTag = Tag.builder()
                .name(normalizedTagName)
                .build();

        return tagRepository.save(newTag);
    }
}
