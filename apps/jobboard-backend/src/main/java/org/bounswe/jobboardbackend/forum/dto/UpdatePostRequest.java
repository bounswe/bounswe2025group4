package org.bounswe.jobboardbackend.forum.dto;

import lombok.Data;

import java.util.List;

@Data
public class UpdatePostRequest {
    private String title;
    private String content;
    private List<String> tags;
}
