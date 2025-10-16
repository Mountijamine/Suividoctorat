package com.devbuild.gestionauth.controller;

import com.devbuild.gestionauth.repository.RoleAuditRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class AuditController {
    private final RoleAuditRepository repo;
    public AuditController(RoleAuditRepository repo) { this.repo = repo; }

    @GetMapping("/admin/role-audit")
    public String list(Model model, @RequestParam(name = "page", required = false, defaultValue = "0") int page,
                       @RequestParam(name = "size", required = false, defaultValue = "50") int size,
                       @RequestParam(name = "action", required = false) String action,
                       @RequestParam(name = "from", required = false) String fromDate,
                       @RequestParam(name = "to", required = false) String toDate) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "timestamp"));
        org.springframework.data.domain.Page<com.devbuild.gestionauth.model.RoleAudit> p;

        java.time.LocalDateTime start = null;
        java.time.LocalDateTime end = null;
        try {
            if (fromDate != null && !fromDate.isBlank()) start = java.time.LocalDate.parse(fromDate).atStartOfDay();
            if (toDate != null && !toDate.isBlank()) end = java.time.LocalDate.parse(toDate).atTime(23,59,59);
        } catch (Exception ex) {
            model.addAttribute("error", "Invalid date format. Use yyyy-MM-dd.");
            p = repo.findAll(pageable);
            model.addAttribute("audits", p.getContent());
            model.addAttribute("page", page);
            model.addAttribute("totalPages", p.getTotalPages());
            return "admin/role_audit";
        }

        if ((start == null) && (end == null)) {
            if (action == null || action.isBlank()) {
                p = repo.findAll(pageable);
            } else {
                p = repo.findByAction(action, pageable);
            }
        } else {
            // use between queries
            if (action == null || action.isBlank()) {
                if (start == null) start = java.time.LocalDateTime.of(1970,1,1,0,0);
                if (end == null) end = java.time.LocalDateTime.now();
                p = repo.findByTimestampBetween(start, end, pageable);
            } else {
                if (start == null) start = java.time.LocalDateTime.of(1970,1,1,0,0);
                if (end == null) end = java.time.LocalDateTime.now();
                p = repo.findByActionAndTimestampBetween(action, start, end, pageable);
            }
        }
        // UI is handled by SPA; keep CSV export for API consumers
        return "redirect:/";
    }

    @GetMapping(path = "/admin/role-audit.csv", produces = "text/csv")
    public org.springframework.http.ResponseEntity<org.springframework.core.io.InputStreamResource> exportCsv(@RequestParam(name = "action", required = false) String action,
                                                                                          @RequestParam(name = "from", required = false) String fromDate,
                                                                                          @RequestParam(name = "to", required = false) String toDate) {
        java.time.LocalDateTime start = null;
        java.time.LocalDateTime end = null;
        try {
            if (fromDate != null && !fromDate.isBlank()) start = java.time.LocalDate.parse(fromDate).atStartOfDay();
            if (toDate != null && !toDate.isBlank()) end = java.time.LocalDate.parse(toDate).atTime(23,59,59);
        } catch (Exception ex) {
            // return bad request
            return org.springframework.http.ResponseEntity.badRequest().build();
        }

        java.util.List<com.devbuild.gestionauth.model.RoleAudit> rows;
        if (start == null && end == null) {
            if (action == null || action.isBlank()) {
                rows = repo.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "timestamp"));
            } else {
                rows = repo.findByAction(action, org.springframework.data.domain.Pageable.unpaged()).getContent();
            }
        } else {
            if (start == null) start = java.time.LocalDateTime.of(1970,1,1,0,0);
            if (end == null) end = java.time.LocalDateTime.now();
            if (action == null || action.isBlank()) {
                rows = repo.findByTimestampBetween(start, end, org.springframework.data.domain.Pageable.unpaged()).getContent();
            } else {
                rows = repo.findByActionAndTimestampBetween(action, start, end, org.springframework.data.domain.Pageable.unpaged()).getContent();
            }
        }

        // Build CSV in-memory
        java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
        try (java.io.PrintWriter pw = new java.io.PrintWriter(baos)) {
            pw.println("id,timestamp,action,role,targetEmail,performedBy,details");
            for (com.devbuild.gestionauth.model.RoleAudit a : rows) {
                String line = String.format("%d,%s,%s,%s,%s,%s,%s",
                        a.getId() != null ? a.getId() : 0,
                        a.getTimestamp() != null ? a.getTimestamp().toString() : "",
                        csvEscape(a.getAction()),
                        csvEscape(a.getRoleName()),
                        csvEscape(a.getTargetEmail()),
                        csvEscape(a.getPerformedBy()),
                        csvEscape(a.getDetails()));
                pw.println(line);
            }
            pw.flush();
        }

        java.io.ByteArrayInputStream bais = new java.io.ByteArrayInputStream(baos.toByteArray());
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.add(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=role_audit.csv");
        return org.springframework.http.ResponseEntity.ok().headers(headers).contentLength(baos.size()).contentType(org.springframework.http.MediaType.parseMediaType("text/csv")).body(new org.springframework.core.io.InputStreamResource(bais));
    }

    private static String csvEscape(String v) {
        if (v == null) return "";
        String out = v.replace("\"", "\"\"");
        if (out.contains(",") || out.contains("\n") || out.contains("\r") || out.contains("\"")) {
            return "\"" + out + "\"";
        }
        return out;
    }
}
