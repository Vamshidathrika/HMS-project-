package com.pixelhms.config;

import com.pixelhms.entity.*;
import com.pixelhms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private WardRepository wardRepository;

    @Autowired
    private BedRepository bedRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private OPInvestigationRepository opInvestigationRepository;

    @Autowired
    private PharmacyInventoryRepository pharmacyInventoryRepository;

    @Autowired
    private TPACompanyRepository tpaCompanyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WhatsAppTemplateRepository templateRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public void run(String... args) throws Exception {
        // Seed Departments & Doctors
        if (departmentRepository.count() == 0) {
            Department genMed = departmentRepository.save(new Department(null, "GENMED", "General Medicine", "Clinical", true));
            Department pedia = departmentRepository.save(new Department(null, "PED", "Pediatrics", "Clinical", true));
            Department cardio = departmentRepository.save(new Department(null, "CARD", "Cardiology", "Clinical", true));
            Department ortho = departmentRepository.save(new Department(null, "ORTHO", "Orthopedics", "Clinical", true));

            if (doctorRepository.count() == 0) {
                doctorRepository.save(new Doctor(null, "DOC001", "Dr. Rajesh Sharma", "MD (General Medicine)", "Consulting Physician", genMed, "9876543201", "rajesh@pixelhms.com", new BigDecimal("500.00")));
                doctorRepository.save(new Doctor(null, "DOC002", "Dr. Priya Patel", "MD (Pediatrics)", "Child Specialist", pedia, "9876543202", "priya@pixelhms.com", new BigDecimal("400.00")));
                doctorRepository.save(new Doctor(null, "DOC003", "Dr. Amit Verma", "DM (Cardiology)", "Interventional Cardiologist", cardio, "9876543203", "amit@pixelhms.com", new BigDecimal("800.00")));
                doctorRepository.save(new Doctor(null, "DOC004", "Dr. Sunita Rao", "MS (Orthopedics)", "Joint Replacement Surgeon", ortho, "9876543204", "sunita@pixelhms.com", new BigDecimal("600.00")));
            }
        }

        // Seed Wards & Beds
        if (wardRepository.count() == 0) {
            Ward maleWard = wardRepository.save(new Ward(null, "MMW", "Male Medical Ward", true));
            Ward femaleWard = wardRepository.save(new Ward(null, "FMW", "Female Medical Ward", true));
            Ward icu = wardRepository.save(new Ward(null, "ICU", "Intensive Care Unit", true));
            Ward pediatricWard = wardRepository.save(new Ward(null, "PEDW", "Pediatric Ward", true));
            Ward privateWard = wardRepository.save(new Ward(null, "PVT", "Private Rooms Ward", true));

            for (int i = 1; i <= 10; i++) {
                bedRepository.save(new Bed(null, "MMW-" + String.format("%02d", i), maleWard, "General", "Available"));
                bedRepository.save(new Bed(null, "FMW-" + String.format("%02d", i), femaleWard, "General", "Available"));
            }
            for (int i = 1; i <= 5; i++) {
                bedRepository.save(new Bed(null, "ICU-" + String.format("%02d", i), icu, "ICU", "Available"));
            }
            for (int i = 1; i <= 5; i++) {
                bedRepository.save(new Bed(null, "PED-" + String.format("%02d", i), pediatricWard, "General", "Available"));
            }
            for (int i = 1; i <= 5; i++) {
                bedRepository.save(new Bed(null, "PVT-" + String.format("%02d", i), privateWard, "Private", "Available"));
            }
        }

        // Seed Patients
        if (patientRepository.count() == 0) {
            Patient p1 = new Patient();
            p1.setUhid("260615AH0000001");
            p1.setPatientName("Aarav Mehta");
            p1.setDateOfBirth(LocalDate.of(1990, 5, 12));
            p1.setGender("M");
            p1.setBloodGroup("O+");
            p1.setMobile("9876543210");
            p1.setEmail("aarav@pixelhms.com");
            p1.setAddressLine1("123, MG Road, Mumbai");
            p1.setCity("Mumbai");
            p1.setState("Maharashtra");
            p1.setPincode("400001");
            p1.setAbhaId("1234-5678-9012-34");
            p1.setAbhaAddress("aarav.mehta@ndhm");
            p1.setRelationName("Sanjay Mehta");
            p1.setOccupation("Software Engineer");
            patientRepository.save(p1);

            Patient p2 = new Patient();
            p2.setUhid("260615AH0000002");
            p2.setPatientName("Ishita Sharma");
            p2.setDateOfBirth(LocalDate.of(1995, 8, 22));
            p2.setGender("F");
            p2.setBloodGroup("B+");
            p2.setMobile("9876543211");
            p2.setEmail("ishita@pixelhms.com");
            p2.setAddressLine1("456, Park Street, Kolkata");
            p2.setCity("Kolkata");
            p2.setState("West Bengal");
            p2.setPincode("700016");
            p2.setRelationName("Sunil Sharma");
            p2.setOccupation("Teacher");
            patientRepository.save(p2);
        }

        // Seed OP Investigations
        if (opInvestigationRepository.count() == 0) {
            List<Patient> seededPatients = patientRepository.findAll();
            List<Doctor> seededDoctors = doctorRepository.findAll();
            if (!seededPatients.isEmpty() && !seededDoctors.isEmpty()) {
                Patient p1 = seededPatients.get(0);
                Doctor d1 = seededDoctors.get(0);
                opInvestigationRepository.save(new OPInvestigation(null, p1, p1.getUhid(), d1, "Complete Blood Count", "Lab", LocalDateTime.now(), false, "Ordered"));
                opInvestigationRepository.save(new OPInvestigation(null, p1, p1.getUhid(), d1, "Chest X-Ray", "Imaging", LocalDateTime.now(), false, "Ordered"));
            }
        }

        // Seed Pharmacy
        if (pharmacyInventoryRepository.count() == 0) {
            pharmacyInventoryRepository.save(new PharmacyInventory(null, "DRG001", "Paracetamol 650mg", "BAT-P887", LocalDate.now().plusYears(2), 150, 10.0, 6.0));
            pharmacyInventoryRepository.save(new PharmacyInventory(null, "DRG002", "Amoxicillin 500mg", "BAT-A992", LocalDate.now().plusYears(1), 100, 25.0, 18.0));
            pharmacyInventoryRepository.save(new PharmacyInventory(null, "DRG003", "Ibuprofen 400mg", "BAT-I552", LocalDate.now().plusYears(2), 200, 15.0, 9.0));
            pharmacyInventoryRepository.save(new PharmacyInventory(null, "DRG004", "Cetirizine 10mg", "BAT-C441", LocalDate.now().plusYears(3), 300, 8.0, 4.0));
            pharmacyInventoryRepository.save(new PharmacyInventory(null, "DRG005", "Metformin 500mg", "BAT-M110", LocalDate.now().plusYears(2), 250, 12.0, 7.0));
        }

        // Seed TPAs
        if (tpaCompanyRepository.count() == 0) {
            tpaCompanyRepository.save(new TPACompany(null, "Star Health Insurance", "Mr. Anand Kumar", "9845012345", "anand@starhealth.in", true));
            tpaCompanyRepository.save(new TPACompany(null, "HDFC Ergo General Insurance", "Ms. Ritu Mehta", "9845054321", "ritu@hdfcergo.com", true));
            tpaCompanyRepository.save(new TPACompany(null, "ICICI Lombard", "Mr. Vinay Rao", "9845098765", "vinay@icicilombard.com", true));
        }

        // Seed Users
        if (userRepository.count() == 0) {
            userRepository.save(new User(null, "admin", passwordEncoder.encode("admin123"), "SuperAdmin", "System Administrator", true));
            userRepository.save(new User(null, "dr_rajesh", passwordEncoder.encode("doctor123"), "Doctor", "Dr. Rajesh Sharma", true));
            userRepository.save(new User(null, "front_desk", passwordEncoder.encode("front123"), "FrontDesk", "Front Desk Operator", true));
            userRepository.save(new User(null, "nurse_jane", passwordEncoder.encode("nurse123"), "Nurse", "Nurse Jane Doe", true));
            userRepository.save(new User(null, "pharmacist", passwordEncoder.encode("pharmacy123"), "Pharmacist", "Lead Pharmacist", true));
            userRepository.save(new User(null, "accountant_bill", passwordEncoder.encode("bill123"), "Accountant", "Accountant Bill", true));
        }

        // Seed WhatsApp Templates
        if (templateRepository.count() == 0) {
            templateRepository.save(new WhatsAppTemplate(null, "Welcome", "Hello {{name}}! Welcome to Ashirwad Hospital. Your unique patient UHID is {{uhid}}. Thank you for choosing us.", true));
            templateRepository.save(new WhatsAppTemplate(null, "OPD Ticket", "Dear {{name}}, your outpatient visit consultation is confirmed with {{doctor}}. Your queue token number is {{token}}. Please wait for your turn.", true));
            templateRepository.save(new WhatsAppTemplate(null, "IP Admission", "Dear {{name}}, your inpatient admission is complete. Allocated Ward: {{ward}}, Bed: {{bed}}. We wish you a speedy recovery.", true));
            templateRepository.save(new WhatsAppTemplate(null, "Bill Invoice", "Dear {{name}}, your billing invoice {{invoice}} for amount {{amount}} has been successfully generated. Thank you, Ashirwad Hospital.", true));
        }
    }
}
