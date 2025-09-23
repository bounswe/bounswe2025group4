package org.bounswe.backend.thread.service;

import org.bounswe.backend.common.exception.UnauthorizedActionException;
import org.bounswe.backend.thread.dto.CreateThreadRequestDto;
import org.bounswe.backend.thread.dto.ThreadDto;
import org.bounswe.backend.thread.dto.UpdateThreadRequestDto;
import org.bounswe.backend.thread.entity.Thread;
import org.bounswe.backend.thread.repository.ThreadRepository;
import org.bounswe.backend.common.exception.NotFoundException;
import org.bounswe.backend.common.exception.UnauthorizedUserException;
import org.bounswe.backend.tag.entity.Tag;
import org.bounswe.backend.tag.repository.TagRepository;
import org.bounswe.backend.user.dto.UserDto;
import org.bounswe.backend.user.entity.User;
import org.bounswe.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

@Service
public class ThreadService {
    private final ThreadRepository threadRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;

    public ThreadService(ThreadRepository threadRepository, UserRepository userRepository, TagRepository tagRepository) {
        this.threadRepository = threadRepository;
        this.userRepository = userRepository;
        this.tagRepository = tagRepository;
    }

    public List<ThreadDto> getAllThreads() {
        return threadRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ThreadDto createThread(Long userId, CreateThreadRequestDto dto) {
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Set<Tag> tags = dto.getTags() == null ? new HashSet<>() :
                dto.getTags().stream()
                        .map(name -> tagRepository.findByNameIgnoreCase(name.toUpperCase())
                                .orElseGet(() -> tagRepository.save(Tag.builder().name(name.toUpperCase()).build())))
                        .collect(Collectors.toSet());

        Thread thread = Thread.builder()
                .title(dto.getTitle())
                .body(dto.getBody())
                .creator(creator)
                .tags(tags)
                .createdAt(LocalDateTime.now())
                .build();

        return toDto(threadRepository.save(thread));
    }

    @Transactional
    public ThreadDto getThreadById(Long threadId) {
        Thread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new NotFoundException("Thread not found"));

        return toDto(thread);
    }

    @Transactional
    public ThreadDto updateThread(Long threadId, Long userId, UpdateThreadRequestDto dto) {
        Thread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new NotFoundException("Thread"));

        if (!thread.getCreator().getId().equals(userId)) {
            throw new UnauthorizedUserException("Only the thread creator can update this thread");
        }

        thread.setTitle(dto.getTitle());
        thread.setBody(dto.getBody());

        if (dto.getTags() != null) {
            Set<Tag> updatedTags = dto.getTags().stream()
                    .map(name -> tagRepository.findByNameIgnoreCase(name.toUpperCase())
                            .orElseGet(() -> tagRepository.save(Tag.builder().name(name.toUpperCase()).build())))
                    .collect(Collectors.toSet());
            thread.setTags(updatedTags);
        }

        thread.setEditedAt(LocalDateTime.now());

        return toDto(threadRepository.save(thread));
    }


    @Transactional
    public void deleteThread(Long threadId, Long userId) {
        Thread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new NotFoundException("Thread not found"));

        if (!thread.getCreator().getId().equals(userId)) {
            throw new UnauthorizedActionException("You are not authorized to delete this thread.");
        }

        threadRepository.delete(thread);
    }



    @Transactional
    public void likeThread(Long threadId, Long userId) {
        Thread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new NotFoundException("Thread not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (!thread.getLikedBy().contains(user)) {
            thread.getLikedBy().add(user);
            threadRepository.save(thread);
        }
    }

    @Transactional
    public void unlikeThread(Long threadId, Long userId) {
        Thread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new NotFoundException("Thread not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        thread.getLikedBy().remove(user);
    }

    public List<UserDto> getLikers(Long threadId) {
        Thread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new NotFoundException("Thread not found"));

        return thread.getLikedBy().stream()
                .map(user -> UserDto.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .userType(user.getUserType())
                        .mentorshipStatus(user.getMentorshipStatus())
                        .build())
                .collect(Collectors.toList());
    }



    @Transactional
    public void reportThread(Long threadId) {
        Thread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new NotFoundException("Thread not found"));

        if (!thread.isReported()) {
            thread.setReported(true);
            threadRepository.save(thread);
        }

    }




    private ThreadDto toDto(Thread thread) {
        return ThreadDto.builder()
                .id(thread.getId())
                .title(thread.getTitle())
                .body(thread.getBody())
                .creatorId(thread.getCreator().getId())
                .creatorUsername(thread.getCreator().getUsername())
                .tags(thread.getTags().stream().map(Tag::getName).collect(Collectors.toList()))
                .reported(thread.isReported())
                .createdAt(thread.getCreatedAt())
                .editedAt(thread.getEditedAt())
                .commentCount(thread.getCommentCount())
                .build();
    }
}
