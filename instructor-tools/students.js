/**
 * Student Storage and Persistence Module
 * Handles adding, updating, retrieving, and persisting student data
 */

// Storage key for localStorage
const STORAGE_KEY = 'panamerican_students';

// Default student data - used if no data exists in storage
const defaultStudents = [
    {
        id: 1,
        name: 'Andrew A.',
        age: 8,
        belt: 'white',
        class: 'kids-beginner',
        attendance: 85,
        joinDate: '2025-09-15',
        phone: '336-555-0101',
        email: 'andrew@example.com'
    },
    {
        id: 2,
        name: 'Denny R.',
        age: 10,
        belt: 'green',
        class: 'kids-intermediate',
        attendance: 92,
        joinDate: '2025-08-20',
        phone: '336-555-0102',
        email: 'denny@example.com'
    },
    {
        id: 3,
        name: 'Luca M.',
        age: 12,
        belt: 'blue',
        class: 'kids-advanced',
        attendance: 88,
        joinDate: '2025-10-01',
        phone: '336-555-0103',
        email: 'luca@example.com'
    },
    {
        id: 4,
        name: 'Noah Davis',
        age: 9,
        belt: 'yellow',
        class: 'kids-beginner',
        attendance: 78,
        joinDate: '2025-10-05',
        phone: '336-555-0104',
        email: 'noah@example.com'
    },
    {
        id: 5,
        name: 'Sophia Wilson',
        age: 25,
        belt: 'red',
        class: 'adult-intermediate',
        attendance: 95,
        joinDate: '2024-12-10',
        phone: '336-555-0105',
        email: 'sophia@example.com'
    },
    {
        id: 6,
        name: 'James Taylor',
        age: 32,
        belt: 'blue',
        class: 'adult-advanced',
        attendance: 82,
        joinDate: '2024-06-15',
        phone: '336-555-0106',
        email: 'james@example.com'
    }
];

/**
 * StudentStorage Class
 * Manages all student-related data operations with localStorage persistence
 */
class StudentStorage {
    constructor() {
        this.students = this.loadStudents();
    }

    /**
     * Load students from localStorage or initialize with defaults
     */
    loadStudents() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading students from storage:', error);
        }
        return [...defaultStudents];
    }

    /**
     * Save students to localStorage
     */
    saveStudents() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.students));
            return true;
        } catch (error) {
            console.error('Error saving students to storage:', error);
            return false;
        }
    }

    /**
     * Get all students
     */
    getAllStudents() {
        return this.students;
    }

    /**
     * Get a student by ID
     */
    getStudentById(id) {
        return this.students.find(s => s.id === id);
    }

    /**
     * Get students by class
     */
    getStudentsByClass(className) {
        return this.students.filter(s => s.class === className);
    }

    /**
     * Get students by belt level
     */
    getStudentsByBelt(belt) {
        return this.students.filter(s => s.belt === belt);
    }

    /**
     * Add a new student
     */
    addStudent(studentData) {
        const newStudent = {
            id: this.getNextId(),
            name: studentData.name,
            age: studentData.age,
            belt: studentData.belt || 'white',
            class: studentData.class,
            attendance: studentData.attendance || 0,
            joinDate: studentData.joinDate || new Date().toISOString().split('T')[0],
            phone: studentData.phone || '',
            email: studentData.email || ''
        };

        this.students.push(newStudent);
        this.saveStudents();
        return newStudent;
    }

    /**
     * Update an existing student
     */
    updateStudent(id, updates) {
        const student = this.getStudentById(id);
        if (student) {
            Object.assign(student, updates);
            this.saveStudents();
            return student;
        }
        return null;
    }

    /**
     * Delete a student
     */
    deleteStudent(id) {
        const index = this.students.findIndex(s => s.id === id);
        if (index !== -1) {
            const deleted = this.students.splice(index, 1);
            this.saveStudents();
            return deleted[0];
        }
        return null;
    }

    /**
     * Update student attendance percentage
     */
    updateAttendance(id, attendancePercentage) {
        return this.updateStudent(id, { attendance: attendancePercentage });
    }

    /**
     * Promote student to next belt
     */
    promoteToBelt(id, newBelt) {
        return this.updateStudent(id, { belt: newBelt });
    }

    /**
     * Transfer student to different class
     */
    transferToClass(id, newClass) {
        return this.updateStudent(id, { class: newClass });
    }

    /**
     * Get next available ID
     */
    getNextId() {
        if (this.students.length === 0) return 1;
        return Math.max(...this.students.map(s => s.id)) + 1;
    }

    /**
     * Search students by name (case-insensitive)
     */
    searchByName(searchTerm) {
        const term = searchTerm.toLowerCase();
        return this.students.filter(s => s.name.toLowerCase().includes(term));
    }

    /**
     * Get statistics
     */
    getStatistics() {
        const stats = {
            totalStudents: this.students.length,
            byBelt: {},
            byClass: {},
            averageAttendance: 0,
            ageDistribution: {}
        };

        let totalAttendance = 0;

        this.students.forEach(student => {
            // Belt distribution
            stats.byBelt[student.belt] = (stats.byBelt[student.belt] || 0) + 1;

            // Class distribution
            stats.byClass[student.class] = (stats.byClass[student.class] || 0) + 1;

            // Attendance average
            totalAttendance += student.attendance;

            // Age distribution
            const ageGroup = Math.floor(student.age / 10) * 10;
            const ageRange = `${ageGroup}-${ageGroup + 9}`;
            stats.ageDistribution[ageRange] = (stats.ageDistribution[ageRange] || 0) + 1;
        });

        stats.averageAttendance = this.students.length > 0 
            ? Math.round(totalAttendance / this.students.length) 
            : 0;

        return stats;
    }

    /**
     * Export students data as JSON
     */
    exportAsJSON() {
        return JSON.stringify(this.students, null, 2);
    }

    /**
     * Import students from JSON
     */
    importFromJSON(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            if (Array.isArray(imported)) {
                this.students = imported;
                this.saveStudents();
                return { success: true, count: imported.length };
            }
            return { success: false, error: 'Invalid format' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Clear all students (use with caution)
     */
    clearAllStudents() {
        if (confirm('Are you sure you want to delete all students? This cannot be undone.')) {
            this.students = [];
            this.saveStudents();
            return true;
        }
        return false;
    }

    /**
     * Reset to default students
     */
    resetToDefaults() {
        if (confirm('Are you sure you want to reset to default students? Current data will be lost.')) {
            this.students = [...defaultStudents];
            this.saveStudents();
            return true;
        }
        return false;
    }
}

// Create a global instance
const studentStorage = new StudentStorage();

// Export for use in other modules
window.studentStorage = studentStorage;

// Backward compatibility - expose as array for existing code
let students = studentStorage.getAllStudents();

// Update the global students array when data changes
function updateGlobalStudentsArray() {
    students = studentStorage.getAllStudents();
}
