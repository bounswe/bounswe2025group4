package org.bounswe.jobboardbackend.jwt.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {
    @GetMapping("/all")
    public String allAccess() {
        return "Public Content.";
    }

    @GetMapping("/employer")
    @PreAuthorize("hasRole('EMPLOYER')")
    public String employerAccess() {
        return "Employer Content.";
    }

    @GetMapping("/jobseeker")
    @PreAuthorize("hasRole('JOBSEEKER')")
    public String jobseekerAccess() {
        return "Jobseeker Content.";
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminAccess() {
        return "Admin Content.";
    }
}

