package org.bounswe.backend.external.service;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.bounswe.backend.external.dto.QuoteDto;

@Service
public class QuoteService {

    private final RestTemplate restTemplate;
    private final String quoteApiUrl = "https://zenquotes.io/api/";

    public QuoteService(RestTemplateBuilder builder) {
        this.restTemplate = builder.build();
    }

    @Cacheable("todayQuote")
    public QuoteDto getTodayQuote() {
        String url = quoteApiUrl + "today";
        ResponseEntity<QuoteDto[]> response = restTemplate.getForEntity(url, QuoteDto[].class);
        if (response.getStatusCode().is2xxSuccessful() && response.hasBody()) {
            assert response.getBody() != null;
            return response.getBody()[0];
        }
        throw new RuntimeException("Failed to fetch quote");
    }

    @CacheEvict(value = "todayQuote", allEntries = true)
    public void evictCache() {}
}
