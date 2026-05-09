package in.gymculture.dto;

import in.gymculture.model.Branch;

public record BranchResponse(
        Long id,
        String name,
        String city
) {
    public static BranchResponse from(Branch branch) {
        return new BranchResponse(branch.getId(), branch.getName(), branch.getCity());
    }
}
