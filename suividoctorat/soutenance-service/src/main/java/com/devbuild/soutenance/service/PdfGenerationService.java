package com.devbuild.soutenance.service;

import com.devbuild.soutenance.model.Soutenance;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;

/**
 * Service for generating PDF documents
 */
@Service
@Slf4j
public class PdfGenerationService {

    @Value("${app.upload.dir:uploads/soutenances}")
    private String uploadDir;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    /**
     * Generate authorization PDF for defense
     */
    public String generateAutorisationPdf(Soutenance soutenance) {
        try {
            // Create directory
            Path pdfDir = Paths.get(uploadDir, soutenance.getId().toString(), "autorisation");
            Files.createDirectories(pdfDir);

            // Generate filename
            String filename = String.format("autorisation_soutenance_%d_%s.pdf",
                soutenance.getId(),
                soutenance.getDateAutorisation().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")));

            String pdfPath = pdfDir.resolve(filename).toString();

            // Create PDF
            PdfWriter writer = new PdfWriter(new FileOutputStream(pdfPath));
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            // Header
            Paragraph header = new Paragraph("AUTORISATION DE SOUTENANCE DE THÈSE")
                .setFontSize(18)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
            document.add(header);

            // Divider
            document.add(new Paragraph("_".repeat(80))
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20));

            // Doctorant information
            document.add(new Paragraph("INFORMATIONS DU DOCTORANT")
                .setFontSize(14)
                .setBold()
                .setMarginTop(10));

            Table doctorantTable = new Table(UnitValue.createPercentArray(new float[]{30, 70}))
                .useAllAvailableWidth();

            doctorantTable.addCell(createCell("Nom et Prénom:"));
            doctorantTable.addCell(createCell(soutenance.getDoctorantNom() + " " + soutenance.getDoctorantPrenom()));

            doctorantTable.addCell(createCell("Email:"));
            doctorantTable.addCell(createCell(soutenance.getDoctorantEmail()));

            document.add(doctorantTable);

            // Thesis information
            document.add(new Paragraph("INFORMATIONS DE LA THÈSE")
                .setFontSize(14)
                .setBold()
                .setMarginTop(20));

            Table theseTable = new Table(UnitValue.createPercentArray(new float[]{30, 70}))
                .useAllAvailableWidth();

            theseTable.addCell(createCell("Titre:"));
            theseTable.addCell(createCell(soutenance.getTitreThese()));

            theseTable.addCell(createCell("Sujet:"));
            theseTable.addCell(createCell(soutenance.getSujet()));

            theseTable.addCell(createCell("Directeur de thèse:"));
            theseTable.addCell(createCell(soutenance.getDirecteurNom()));

            document.add(theseTable);

            // Defense information
            document.add(new Paragraph("INFORMATIONS DE LA SOUTENANCE")
                .setFontSize(14)
                .setBold()
                .setMarginTop(20));

            Table soutenanceTable = new Table(UnitValue.createPercentArray(new float[]{30, 70}))
                .useAllAvailableWidth();

            soutenanceTable.addCell(createCell("Date:"));
            soutenanceTable.addCell(createCell(soutenance.getDateDefense().format(DATE_FORMATTER)));

            soutenanceTable.addCell(createCell("Heure:"));
            soutenanceTable.addCell(createCell(soutenance.getHeureDefense().format(TIME_FORMATTER)));

            soutenanceTable.addCell(createCell("Salle:"));
            soutenanceTable.addCell(createCell(soutenance.getSalleDefense()));

            document.add(soutenanceTable);

            // Jury information
            if (soutenance.getJury() != null) {
                document.add(new Paragraph("COMPOSITION DU JURY")
                    .setFontSize(14)
                    .setBold()
                    .setMarginTop(20));

                document.add(new Paragraph("Président du jury: " + soutenance.getJury().getPresidentNom())
                    .setMarginLeft(20));

                document.add(new Paragraph("Rapporteurs:")
                    .setBold()
                    .setMarginLeft(20)
                    .setMarginTop(10));

                soutenance.getJury().getRapporteurs().forEach(rapporteur -> {
                    document.add(new Paragraph(String.format("- %s %s (%s - %s)",
                        rapporteur.getNom(),
                        rapporteur.getPrenom(),
                        rapporteur.getGrade(),
                        rapporteur.getInstitution()))
                        .setMarginLeft(40));
                });

                document.add(new Paragraph("Examinateurs:")
                    .setBold()
                    .setMarginLeft(20)
                    .setMarginTop(10));

                soutenance.getJury().getExaminateurs().forEach(examinateur -> {
                    document.add(new Paragraph(String.format("- %s %s (%s - %s)",
                        examinateur.getNom(),
                        examinateur.getPrenom(),
                        examinateur.getGrade(),
                        examinateur.getInstitution()))
                        .setMarginLeft(40));
                });
            }

            // Authorization text
            document.add(new Paragraph("\n\nPar la présente, il est autorisé à " +
                soutenance.getDoctorantNom() + " " + soutenance.getDoctorantPrenom() +
                " de soutenir sa thèse de doctorat intitulée « " + soutenance.getTitreThese() + " » " +
                "le " + soutenance.getDateDefense().format(DATE_FORMATTER) + " à " +
                soutenance.getHeureDefense().format(TIME_FORMATTER) + ".")
                .setMarginTop(30)
                .setTextAlignment(TextAlignment.JUSTIFIED));

            // Footer
            document.add(new Paragraph("\n\nFait le " + soutenance.getDateAutorisation().format(DATE_FORMATTER))
                .setMarginTop(40)
                .setTextAlignment(TextAlignment.RIGHT));

            document.add(new Paragraph("L'Administration")
                .setBold()
                .setMarginTop(20)
                .setTextAlignment(TextAlignment.RIGHT));

            document.close();

            log.info("Authorization PDF generated successfully: {}", pdfPath);
            return pdfPath;

        } catch (Exception ex) {
            log.error("Error generating authorization PDF", ex);
            throw new RuntimeException("Impossible de générer le PDF d'autorisation", ex);
        }
    }

    private String createCell(String content) {
        return content != null ? content : "";
    }
}
