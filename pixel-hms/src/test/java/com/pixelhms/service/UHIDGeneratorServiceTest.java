package com.pixelhms.service;

import com.pixelhms.entity.UHIDSequence;
import com.pixelhms.repository.UHIDSequenceRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UHIDGeneratorServiceTest {

    @Mock
    private UHIDSequenceRepository sequenceRepository;

    @InjectMocks
    private UHIDGeneratorService generatorService;

    @Test
    public void testGenerateUHID() {
        UHIDSequence mockSequence = new UHIDSequence("AH", 42L);
        when(sequenceRepository.findById("AH")).thenReturn(Optional.of(mockSequence));
        
        // Save and flush updates the state, mock it to return the updated sequence
        when(sequenceRepository.saveAndFlush(any(UHIDSequence.class))).thenAnswer(invocation -> {
            UHIDSequence seq = invocation.getArgument(0);
            return seq;
        });

        String uhid = generatorService.generate("AH");
        
        assertNotNull(uhid);
        assertEquals(15, uhid.length(), "UHID should be exactly 15 characters long");
        assertTrue(uhid.contains("AH"), "UHID should contain the facility code");
        assertTrue(uhid.endsWith("0000043"), "UHID sequence should increment from 42 to 43 and be padded to 7 digits");
        
        verify(sequenceRepository, times(1)).findById("AH");
        verify(sequenceRepository, times(1)).saveAndFlush(any(UHIDSequence.class));
    }
}
