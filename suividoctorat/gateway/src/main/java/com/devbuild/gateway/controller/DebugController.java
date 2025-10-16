package com.devbuild.gateway.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class DebugController {

    @GetMapping("/api/debug/echo-headers")
    public ResponseEntity<?> echoHeaders(@RequestHeader Map<String, String> headers) {
        // Return the headers as JSON so the browser can show what it sent and what passed through
        return ResponseEntity.ok(headers);
    }
}
