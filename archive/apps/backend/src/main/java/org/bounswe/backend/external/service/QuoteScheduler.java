package org.bounswe.backend.external.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class QuoteScheduler {

    private final QuoteService quoteService;

    public QuoteScheduler(QuoteService quoteService) {
        this.quoteService = quoteService;
    }

    @Scheduled(cron = "0 0 0 * * *")
    public void scheduleQuoteUpdate() {
        quoteService.evictCache();
        quoteService.getTodayQuote();
    }
}
