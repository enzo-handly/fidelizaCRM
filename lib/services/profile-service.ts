import { ProfileRepository } from "../repositories/profile-repository";
import { ValidationError, NotFoundError, AuthenticationError } from "../errors/app-errors";
import type { Profile } from "../types";

export interface UpdateProfileDTO {
  full_name?: string;
}

/**
 * Service for managing user profiles (not admin user management)
 * For admin user management, see UserService
 */
export class ProfileService {
  constructor(private profileRepository: ProfileRepository) {}

  /**
   * Validates profile update data
   */
  private validateProfileData(data: UpdateProfileDTO): void {
    if (data.full_name !== undefined) {
      if (!data.full_name || data.full_name.trim().length === 0) {
        throw new ValidationError("El nombre completo es requerido");
      }

      if (data.full_name.length > 200) {
        throw new ValidationError("El nombre completo no puede exceder 200 caracteres");
      }
    }
  }

  /**
   * Get profile by ID
   */
  async findById(id: string): Promise<Profile | null> {
    return this.profileRepository.findById(id);
  }

  /**
   * Get all profiles
   */
  async findAll(): Promise<Profile[]> {
    return this.profileRepository.findAll();
  }

  /**
   * Update a user's profile (typically their own)
   */
  async update(userId: string, data: UpdateProfileDTO): Promise<Profile> {
    this.validateProfileData(data);

    const existing = await this.profileRepository.findById(userId);
    if (!existing) {
      throw new NotFoundError("Perfil no encontrado");
    }

    return this.profileRepository.update(userId, data) as Promise<Profile>;
  }
}
