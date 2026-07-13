package com.pixelhms.controller;

import com.pixelhms.config.SecurityHelper;
import com.pixelhms.entity.*;
import com.pixelhms.repository.*;
import com.pixelhms.service.AuditLogService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/masters")
@CrossOrigin(origins = "*")
public class MasterController {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private WardRepository wardRepository;

    @Autowired
    private BedRepository bedRepository;

    @Autowired
    private TestMasterRepository testMasterRepository;

    @Autowired
    private PharmacyInventoryRepository pharmacyInventoryRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private SecurityHelper securityHelper;

    private String[] getUserInfo(String authHeader) {
        SecurityHelper.UserPrincipal principal = securityHelper.resolvePrincipal(authHeader);
        String username = principal.getUsername();
        String role = "anonymous".equals(username) ? "Guest" : principal.getRole();
        return new String[]{username, role};
    }

    private String getIp(String ipAddress) {
        return securityHelper.resolveIpAddress(ipAddress);
    }

    // --- DEPARTMENTS ---
    @GetMapping("/departments")
    public ResponseEntity<List<Department>> getDepartments() {
        return ResponseEntity.ok(departmentRepository.findAll());
    }

    @PostMapping("/departments")
    public ResponseEntity<Department> createDepartment(
            @Valid @RequestBody Department dept,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        String[] info = getUserInfo(authHeader);
        Department saved = departmentRepository.save(dept);
        auditLogService.log(info[0], info[1], "MASTER_DEPT_CREATE", "Created department: " + saved.getDeptName() + " (" + saved.getDeptCode() + ")", getIp(ipAddress), "SUCCESS");
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/departments/{id}")
    public ResponseEntity<Department> updateDepartment(
            @PathVariable Long id,
            @Valid @RequestBody Department dept,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        String[] info = getUserInfo(authHeader);
        Department existing = departmentRepository.findById(id).orElseThrow(() -> new RuntimeException("Dept not found"));
        existing.setDeptCode(dept.getDeptCode());
        existing.setDeptName(dept.getDeptName());
        existing.setDeptType(dept.getDeptType());
        existing.setIsActive(dept.getIsActive());
        Department saved = departmentRepository.save(existing);
        auditLogService.log(info[0], info[1], "MASTER_DEPT_UPDATE", "Updated department ID: " + id + " to: " + saved.getDeptName(), getIp(ipAddress), "SUCCESS");
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/departments/{id}")
    public ResponseEntity<Void> deleteDepartment(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        String[] info = getUserInfo(authHeader);
        departmentRepository.deleteById(id);
        auditLogService.log(info[0], info[1], "MASTER_DEPT_DELETE", "Deleted department ID: " + id, getIp(ipAddress), "SUCCESS");
        return ResponseEntity.ok().build();
    }

    // --- DOCTORS ---
    @GetMapping("/doctors")
    public ResponseEntity<List<Doctor>> getDoctors() {
        return ResponseEntity.ok(doctorRepository.findAll());
    }

    @PostMapping("/doctors")
    public ResponseEntity<Doctor> createDoctor(
            @Valid @RequestBody Doctor doc,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        String[] info = getUserInfo(authHeader);
        if (doc.getDepartment() != null && doc.getDepartment().getId() != null) {
            Department dept = departmentRepository.findById(doc.getDepartment().getId()).orElse(null);
            doc.setDepartment(dept);
        }
        Doctor saved = doctorRepository.save(doc);
        auditLogService.log(info[0], info[1], "MASTER_DOCTOR_CREATE", "Created doctor: " + saved.getName() + " (" + saved.getDoctorCode() + ")", getIp(ipAddress), "SUCCESS");
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/doctors/{id}")
    public ResponseEntity<Doctor> updateDoctor(
            @PathVariable Long id,
            @Valid @RequestBody Doctor doc,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        String[] info = getUserInfo(authHeader);
        Doctor existing = doctorRepository.findById(id).orElseThrow(() -> new RuntimeException("Doctor not found"));
        existing.setDoctorCode(doc.getDoctorCode());
        existing.setName(doc.getName());
        existing.setQualification(doc.getQualification());
        existing.setSpecialization(doc.getSpecialization());
        existing.setMobile(doc.getMobile());
        existing.setEmail(doc.getEmail());
        existing.setConsultingFee(doc.getConsultingFee());
        if (doc.getDepartment() != null && doc.getDepartment().getId() != null) {
            Department dept = departmentRepository.findById(doc.getDepartment().getId()).orElse(null);
            existing.setDepartment(dept);
        }
        Doctor saved = doctorRepository.save(existing);
        auditLogService.log(info[0], info[1], "MASTER_DOCTOR_UPDATE", "Updated doctor ID: " + id + " to: " + saved.getName(), getIp(ipAddress), "SUCCESS");
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/doctors/{id}")
    public ResponseEntity<Void> deleteDoctor(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        String[] info = getUserInfo(authHeader);
        doctorRepository.deleteById(id);
        auditLogService.log(info[0], info[1], "MASTER_DOCTOR_DELETE", "Deleted doctor ID: " + id, getIp(ipAddress), "SUCCESS");
        return ResponseEntity.ok().build();
    }

    // --- WARDS ---
    @GetMapping("/wards")
    public ResponseEntity<List<Ward>> getWards() {
        return ResponseEntity.ok(wardRepository.findAll());
    }

    @PostMapping("/wards")
    public ResponseEntity<Ward> createWard(
            @RequestBody Ward ward,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        String[] info = getUserInfo(authHeader);
        Ward saved = wardRepository.save(ward);
        auditLogService.log(info[0], info[1], "MASTER_WARD_CREATE", "Created ward: " + saved.getName() + " (" + saved.getCode() + ")", getIp(ipAddress), "SUCCESS");
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/wards/{id}")
    public ResponseEntity<Ward> updateWard(
            @PathVariable Long id,
            @RequestBody Ward ward,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        String[] info = getUserInfo(authHeader);
        Ward existing = wardRepository.findById(id).orElseThrow(() -> new RuntimeException("Ward not found"));
        existing.setCode(ward.getCode());
        existing.setName(ward.getName());
        existing.setIsActive(ward.getIsActive());
        Ward saved = wardRepository.save(existing);
        auditLogService.log(info[0], info[1], "MASTER_WARD_UPDATE", "Updated ward ID: " + id + " to: " + saved.getName(), getIp(ipAddress), "SUCCESS");
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/wards/{id}")
    public ResponseEntity<Void> deleteWard(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        String[] info = getUserInfo(authHeader);
        wardRepository.deleteById(id);
        auditLogService.log(info[0], info[1], "MASTER_WARD_DELETE", "Deleted ward ID: " + id, getIp(ipAddress), "SUCCESS");
        return ResponseEntity.ok().build();
    }

    // --- BEDS ---
    @GetMapping("/beds")
    public ResponseEntity<List<Bed>> getBeds() {
        return ResponseEntity.ok(bedRepository.findAll());
    }

    @PostMapping("/beds")
    public ResponseEntity<Bed> createBed(
            @RequestBody Bed bed,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        String[] info = getUserInfo(authHeader);
        if (bed.getWard() != null && bed.getWard().getId() != null) {
            Ward ward = wardRepository.findById(bed.getWard().getId()).orElse(null);
            bed.setWard(ward);
        }
        Bed saved = bedRepository.save(bed);
        auditLogService.log(info[0], info[1], "MASTER_BED_CREATE", "Created bed: " + saved.getBedNumber() + " (Ward ID: " + (saved.getWard() != null ? saved.getWard().getId() : "none") + ")", getIp(ipAddress), "SUCCESS");
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/beds/{id}")
    public ResponseEntity<Bed> updateBed(
            @PathVariable Long id,
            @RequestBody Bed bed,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        String[] info = getUserInfo(authHeader);
        Bed existing = bedRepository.findById(id).orElseThrow(() -> new RuntimeException("Bed not found"));
        existing.setBedNumber(bed.getBedNumber());
        existing.setRoomType(bed.getRoomType());
        existing.setStatus(bed.getStatus());
        if (bed.getWard() != null && bed.getWard().getId() != null) {
            Ward ward = wardRepository.findById(bed.getWard().getId()).orElse(null);
            existing.setWard(ward);
        }
        Bed saved = bedRepository.save(existing);
        auditLogService.log(info[0], info[1], "MASTER_BED_UPDATE", "Updated bed ID: " + id + " to: " + saved.getBedNumber(), getIp(ipAddress), "SUCCESS");
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/beds/{id}")
    public ResponseEntity<Void> deleteBed(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        String[] info = getUserInfo(authHeader);
        bedRepository.deleteById(id);
        auditLogService.log(info[0], info[1], "MASTER_BED_DELETE", "Deleted bed ID: " + id, getIp(ipAddress), "SUCCESS");
        return ResponseEntity.ok().build();
    }

    // --- TESTS CATALOG (TestMaster) ---
    @GetMapping("/tests")
    public ResponseEntity<List<TestMaster>> getTests() {
        return ResponseEntity.ok(testMasterRepository.findAll());
    }

    @PostMapping("/tests")
    public ResponseEntity<TestMaster> createTest(
            @RequestBody TestMaster test,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        String[] info = getUserInfo(authHeader);
        TestMaster saved = testMasterRepository.save(test);
        auditLogService.log(info[0], info[1], "MASTER_TEST_CREATE", "Created test: " + saved.getTestName() + " (" + saved.getTestCode() + ")", getIp(ipAddress), "SUCCESS");
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/tests/{id}")
    public ResponseEntity<TestMaster> updateTest(
            @PathVariable Long id,
            @RequestBody TestMaster test,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        String[] info = getUserInfo(authHeader);
        TestMaster existing = testMasterRepository.findById(id).orElseThrow(() -> new RuntimeException("Test not found"));
        existing.setTestCode(test.getTestCode());
        existing.setTestName(test.getTestName());
        existing.setTestCategory(test.getTestCategory());
        existing.setPrice(test.getPrice());
        existing.setActive(test.isActive());
        TestMaster saved = testMasterRepository.save(existing);
        auditLogService.log(info[0], info[1], "MASTER_TEST_UPDATE", "Updated test ID: " + id + " to: " + saved.getTestName(), getIp(ipAddress), "SUCCESS");
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/tests/{id}")
    public ResponseEntity<Void> deleteTest(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        String[] info = getUserInfo(authHeader);
        testMasterRepository.deleteById(id);
        auditLogService.log(info[0], info[1], "MASTER_TEST_DELETE", "Deleted test ID: " + id, getIp(ipAddress), "SUCCESS");
        return ResponseEntity.ok().build();
    }

    // --- MEDICINES ---
    @GetMapping("/medicines")
    public ResponseEntity<List<PharmacyInventory>> getMedicines() {
        return ResponseEntity.ok(pharmacyInventoryRepository.findAll());
    }

    @PostMapping("/medicines")
    public ResponseEntity<PharmacyInventory> createMedicine(
            @RequestBody PharmacyInventory medicine,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        String[] info = getUserInfo(authHeader);
        PharmacyInventory saved = pharmacyInventoryRepository.save(medicine);
        auditLogService.log(info[0], info[1], "MASTER_MEDICINE_CREATE", "Created drug item: " + saved.getDrugName() + " (" + saved.getDrugCode() + ")", getIp(ipAddress), "SUCCESS");
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/medicines/{id}")
    public ResponseEntity<PharmacyInventory> updateMedicine(
            @PathVariable Long id,
            @RequestBody PharmacyInventory medicine,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        String[] info = getUserInfo(authHeader);
        PharmacyInventory existing = pharmacyInventoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Medicine not found"));
        existing.setDrugCode(medicine.getDrugCode());
        existing.setDrugName(medicine.getDrugName());
        existing.setBatchNumber(medicine.getBatchNumber());
        existing.setExpiryDate(medicine.getExpiryDate());
        existing.setCurrentStock(medicine.getCurrentStock());
        existing.setUnitPrice(medicine.getUnitPrice());
        existing.setPurchasePrice(medicine.getPurchasePrice());
        PharmacyInventory saved = pharmacyInventoryRepository.save(existing);
        auditLogService.log(info[0], info[1], "MASTER_MEDICINE_UPDATE", "Updated drug item ID: " + id + " to: " + saved.getDrugName(), getIp(ipAddress), "SUCCESS");
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/medicines/{id}")
    public ResponseEntity<Void> deleteMedicine(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        String[] info = getUserInfo(authHeader);
        pharmacyInventoryRepository.deleteById(id);
        auditLogService.log(info[0], info[1], "MASTER_MEDICINE_DELETE", "Deleted drug item ID: " + id, getIp(ipAddress), "SUCCESS");
        return ResponseEntity.ok().build();
    }
}
