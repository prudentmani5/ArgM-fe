export class EmployeeAttendancyMapping {
    matriculeId: string;
    userId: number | null;
    firstName: string;
    lastName: string;
    isActive: boolean;
    createdBy: string;
    createdDate: Date | null;
    updatedBy: string;
    updatedDate: Date | null;

    constructor() {
        this.matriculeId = '';
        this.userId = null;
        this.firstName = '';
        this.lastName = '';
        this.isActive = true;
        this.createdBy = '';
        this.createdDate = null;
        this.updatedBy = '';
        this.updatedDate = null;
    }
}
