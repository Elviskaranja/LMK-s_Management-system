
package com.lawfirm.backend.controller;

import com.lawfirm.backend.entity.Role;
import com.lawfirm.backend.service.RoleService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@CrossOrigin(origins = "http://localhost:5173")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @GetMapping
    public List<Role> getAllRoles() {
        return roleService.getAllRoles();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Role> getRoleById(@PathVariable Integer id) {
        return roleService.getRoleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Role> createRole(@RequestBody Role role) {
        Role saved = roleService.saveRole(role);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Role> updateRole(
            @PathVariable Integer id, @RequestBody Role role) {

        if (roleService.getRoleById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        role.setRoleId(id);
        return ResponseEntity.ok(roleService.saveRole(role));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable Integer id) {
        if (roleService.getRoleById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        roleService.deleteRole(id);
        return ResponseEntity.noContent().build();
    }
}
