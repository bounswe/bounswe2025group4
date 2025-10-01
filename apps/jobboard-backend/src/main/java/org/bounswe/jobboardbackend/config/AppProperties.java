package org.bounswe.jobboardbackend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private String env = "local";

    public String getEnv() {
        return env;
    }

    public void setEnv(String env) {
        this.env = env;
    }
}