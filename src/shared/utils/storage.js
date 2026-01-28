/**
 * CrochetGenius Storage Layer
 * Simplified version of IntelliKnit's storage system
 * Handles localStorage with error recovery and data validation
 */

class StorageAdapter {
    constructor() {
        this.storageKey = 'crochetgenius-projects';
        this.backupKey = 'crochetgenius-projects-backup';
        this.isAvailable = this.checkAvailability();
        this.inMemoryFallback = [];
    }

    checkAvailability() {
        try {
            const testKey = 'crochetgenius-test';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            console.warn('localStorage unavailable, using in-memory storage', error);
            return false;
        }
    }

    safeJsonParse(jsonString) {
        if (!jsonString || jsonString.trim() === '') {
            return { success: true, data: [] };
        }

        try {
            const parsed = JSON.parse(jsonString);
            if (!Array.isArray(parsed)) {
                throw new Error('Data is not an array');
            }

            const validProjects = parsed.filter(project => {
                return project &&
                    typeof project === 'object' &&
                    typeof project.id === 'string' &&
                    typeof project.name === 'string' &&
                    Array.isArray(project.components);
            });

            return { success: true, data: validProjects };
        } catch (error) {
            console.error('JSON parse error:', error);
            return { success: false, data: [], error: error.message };
        }
    }

    async getProjects() {
        if (!this.isAvailable) {
            return this.inMemoryFallback;
        }

        try {
            const saved = localStorage.getItem(this.storageKey);
            const parseResult = this.safeJsonParse(saved);

            if (parseResult.success) {
                return parseResult.data;
            }

            // Try backup
            const backupData = localStorage.getItem(this.backupKey);
            const backupResult = this.safeJsonParse(backupData);

            if (backupResult.success) {
                console.log('✅ Recovered from backup');
                await this.saveProjects(backupResult.data);
                return backupResult.data;
            }

            return [];
        } catch (error) {
            console.error('Critical error in getProjects:', error);
            return [];
        }
    }

    async saveProjects(projects) {
        if (!Array.isArray(projects)) {
            console.error('Invalid projects data');
            return false;
        }

        if (!this.isAvailable) {
            this.inMemoryFallback = projects;
            return true;
        }

        try {
            const current = localStorage.getItem(this.storageKey);
            if (current) {
                localStorage.setItem(this.backupKey, current);
            }

            localStorage.setItem(this.storageKey, JSON.stringify(projects));
            console.log('✅ Projects saved');
            return true;
        } catch (error) {
            console.error('Error saving:', error);
            return false;
        }
    }

    async deleteProject(projectId) {
        const projects = await this.getProjects();
        const filtered = projects.filter(p => p.id !== projectId);
        return await this.saveProjects(filtered);
    }

    async clearAll() {
        if (this.isAvailable) {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.backupKey);
        }
        this.inMemoryFallback = [];
        return true;
    }
}

export const storage = new StorageAdapter();
export default storage;
