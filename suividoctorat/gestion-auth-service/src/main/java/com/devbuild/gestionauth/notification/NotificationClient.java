package com.devbuild.gestionauth.notification;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.reactor.circuitbreaker.operator.CircuitBreakerOperator;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Counter;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.Map;

@Component
public class NotificationClient {

    private final WebClient client;
    private final String baseUrl;
    private final String internalSecret;
    private final CircuitBreaker circuitBreaker;
    private final Counter notificationCounter;

    public NotificationClient(@Value("${app.notification.url:}") String baseUrl, WebClient.Builder builder,
                              @Value("${app.notification.internal-secret:}") String internalSecret,
                              org.springframework.beans.factory.ObjectProvider<CircuitBreakerRegistry> cbRegistryProvider,
                              org.springframework.beans.factory.ObjectProvider<MeterRegistry> meterRegistryProvider) {
        this.baseUrl = baseUrl;
        this.internalSecret = internalSecret;
        this.client = builder.baseUrl(baseUrl).build();
        // Use provided CircuitBreakerRegistry if available, otherwise create a default one
    CircuitBreakerRegistry cbRegistry = cbRegistryProvider.getIfAvailable(() -> CircuitBreakerRegistry.ofDefaults());
    this.circuitBreaker = cbRegistry.circuitBreaker("notificationClient");
        // Use provided MeterRegistry if available, otherwise fall back to a simple in-memory registry
        MeterRegistry mr = meterRegistryProvider.getIfAvailable(() -> new io.micrometer.core.instrument.simple.SimpleMeterRegistry());
        this.notificationCounter = Counter.builder("notifications.sent.count").description("Number of notification attempts").register(mr);
    }

    public Mono<Void> sendProfileRequest(Map<String, String> payload) {
        if (baseUrl == null || baseUrl.isBlank()) return Mono.empty();
        org.springframework.web.reactive.function.client.WebClient.RequestHeadersSpec<?> req = client.post().uri("").bodyValue(payload);
        if (internalSecret != null && !internalSecret.isBlank()) {
            req = req.header("X-INTERNAL-AUTH", internalSecret);
        }
    Mono<Void> call = req.retrieve()
        .bodyToMono(Void.class)
        .retryWhen(Retry.backoff(3, Duration.ofSeconds(1)).filter(t -> true))
        .doOnSuccess(v -> notificationCounter.increment())
        .onErrorResume(e -> Mono.empty())
        .then();
    return call.transformDeferred(CircuitBreakerOperator.of(circuitBreaker));
    }
}
