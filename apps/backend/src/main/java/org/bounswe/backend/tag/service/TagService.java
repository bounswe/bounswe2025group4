package org.bounswe.backend.tag.service;

import org.bounswe.backend.tag.entity.Tag;
import org.bounswe.backend.tag.repository.TagRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

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
                .collect(Collectors.toList());
    }
}
