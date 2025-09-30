package org.bounswe.jobboardbackend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {

    @GetMapping("/")
    public MessageResponse hello() {
        return new MessageResponse("Hello World!");
    }

    public record MessageResponse(String message) {}

}
