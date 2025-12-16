package org.bounswe.jobboardbackend.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BanUserRequest {

    @NotBlank(message = "Ban reason must not be blank")
    @Size(max = 500, message = "Ban reason must be at most 500 characters")
    private String reason;
}
