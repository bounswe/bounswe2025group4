package org.bounswe.backend.external.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/quote")
public class QuoteController {

    private final QuoteService quoteService;

    public QuoteController(QuoteService quoteService) {
        this.quoteService = quoteService;
    }

    @GetMapping("/today")
    public ResponseEntity<QuoteDto> getTodayQuote() {
        return ResponseEntity.ok(quoteService.getTodayQuote());
    }
}