package com.devbuild.inscription.service;

import com.devbuild.inscription.model.*;
import com.devbuild.inscription.model.enums.StatutDossier;
import com.devbuild.inscription.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InscriptionServiceTest {

    @Mock
    private DoctorantRepository doctorantRepository;

    @Mock
    private DossierInscriptionRepository dossierRepository;

    @Mock
    private CampagneInscriptionRepository campagneRepository;

    @Mock
    private PieceJointeRepository pieceRepository;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private InscriptionService inscriptionService;

    private Doctorant doctorant;
    private CampagneInscription campagne;
    private DossierInscription dossier;

    @BeforeEach
    void setUp() {
        doctorant = new Doctorant("John", "Doe", "john.doe@example.com");
        doctorant.setId(1L);

        campagne = new CampagneInscription();
        campagne.setId(1L);
        campagne.setNom("Campagne 2025");
        campagne.setActive(true);
        campagne.setDateOuverture(LocalDate.now().minusDays(1));
        campagne.setDateFermeture(LocalDate.now().plusDays(30));

        dossier = new DossierInscription();
        dossier.setSujetThese("Intelligence Artificielle");
        dossier.setDirecteurThese("Prof. Smith");
        dossier.setCampagne(campagne);
    }

    @Test
    void testSoumettreDossier_Success() {
        // Given
        when(doctorantRepository.findById(1L)).thenReturn(Optional.of(doctorant));
        when(campagneRepository.findByActiveTrue()).thenReturn(Arrays.asList(campagne));
        when(campagneRepository.findById(1L)).thenReturn(Optional.of(campagne));
        when(dossierRepository.save(any(DossierInscription.class))).thenReturn(dossier);

        // When
        DossierInscription result = inscriptionService.soumettreDossier(1L, dossier);

        // Then
        assertNotNull(result);
        assertEquals(StatutDossier.SOUMIS, result.getStatut());
        assertEquals(doctorant, result.getDoctorant());
        verify(notificationService).notifyDirecteur(any(DossierInscription.class));
        verify(notificationService).notifyAdmin(any(DossierInscription.class));
    }

    @Test
    void testSoumettreDossier_DoctorantNotFound() {
        // Given
        when(doctorantRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(IllegalArgumentException.class, 
            () -> inscriptionService.soumettreDossier(1L, dossier));
    }

    @Test
    void testSoumettreDossier_CampagneClosed() {
        // Given
        campagne.setDateOuverture(LocalDate.now().plusDays(1)); // Campaign not yet open
        when(doctorantRepository.findById(1L)).thenReturn(Optional.of(doctorant));
        when(campagneRepository.findById(1L)).thenReturn(Optional.of(campagne));

        // When & Then
        assertThrows(IllegalStateException.class, 
            () -> inscriptionService.soumettreDossier(1L, dossier));
    }

    @Test
    void testDonnerAvisDirecteur_Success() {
        // Given
        dossier.setId(1L);
        when(dossierRepository.findById(1L)).thenReturn(Optional.of(dossier));
        when(dossierRepository.save(any(DossierInscription.class))).thenReturn(dossier);

        // When
        DossierInscription result = inscriptionService.donnerAvisDirecteur(1L, "Favorable");

        // Then
        assertEquals("Favorable", result.getAvisDirecteur());
        assertNotNull(result.getDateAvisDirecteur());
        verify(notificationService).notifyAdmin(any(DossierInscription.class));
    }

    @Test
    void testValiderParAdmin_Accept() {
        // Given
        dossier.setId(1L);
        when(dossierRepository.findById(1L)).thenReturn(Optional.of(dossier));
        when(dossierRepository.save(any(DossierInscription.class))).thenReturn(dossier);

        // When
        DossierInscription result = inscriptionService.validerParAdmin(1L, true, "Dossier complet");

        // Then
        assertEquals(StatutDossier.VALIDÉ, result.getStatut());
        assertEquals("Dossier complet", result.getAvisAdmin());
        assertNotNull(result.getDateValidationAdmin());
        verify(notificationService).notifyDoctorant(any(DossierInscription.class), eq(true));
    }

    @Test
    void testValiderParAdmin_Reject() {
        // Given
        dossier.setId(1L);
        when(dossierRepository.findById(1L)).thenReturn(Optional.of(dossier));
        when(dossierRepository.save(any(DossierInscription.class))).thenReturn(dossier);

        // When
        DossierInscription result = inscriptionService.validerParAdmin(1L, false, "Documents manquants");

        // Then
        assertEquals(StatutDossier.REJETÉ, result.getStatut());
        assertEquals("Documents manquants", result.getAvisAdmin());
        verify(notificationService).notifyDoctorant(any(DossierInscription.class), eq(false));
    }
}