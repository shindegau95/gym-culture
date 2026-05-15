package in.vis.controller;

import in.vis.dto.BranchResponse;
import in.vis.exception.NotFoundException;
import in.vis.repository.BranchRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/branches")
public class BranchController {

    private final BranchRepository branchRepository;

    public BranchController(BranchRepository branchRepository) {
        this.branchRepository = branchRepository;
    }

    @GetMapping
    public List<BranchResponse> list() {
        return branchRepository.findAll().stream()
                .map(BranchResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public BranchResponse get(@PathVariable Long id) {
        return branchRepository.findById(id)
                .map(BranchResponse::from)
                .orElseThrow(() -> new NotFoundException("Branch not found: " + id));
    }
}
