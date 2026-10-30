import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { TravelExpenseRequest, ExpenseAttachment } from '../../core/models';
import { 
  LucidePlus, LucideReceipt, LucideX, LucidePaperclip, 
  LucideFileText, LucideTrash2, LucideUpload, LucideEye
} from '@lucide/angular';

@Component({
  selector: 'app-travel-expense',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    LucidePlus, 
    LucideReceipt, 
    LucideX,
    LucidePaperclip,
    LucideFileText,
    LucideTrash2,
    LucideUpload,
    LucideEye
  ],
  templateUrl: './travel-expense.component.html'
})
export class TravelExpenseComponent implements OnInit {
  private api = inject(ApiService);
  private authService = inject(AuthService);

  currentUser = this.authService.currentUser;
  allItems = signal<TravelExpenseRequest[]>([]);
  showApplyModal = signal<boolean>(false);
  loading = signal<boolean>(true);

  // Filter so that only logged-in user's claims are shown
  items = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    return this.allItems().filter(item => 
      item.employeeId === user.employeeId || 
      item.employeeId === user.id ||
      item.employeeName?.trim().toLowerCase() === user.name?.trim().toLowerCase()
    );
  });

  // Form State
  type: 'Expense' | 'Travel' = 'Expense';
  title = '';
  amount = 2500;
  category = 'Client Hospitality & Dinner';
  desc = '';
  attachments = signal<ExpenseAttachment[]>([]);

  // Preview Modal
  previewDoc = signal<ExpenseAttachment | null>(null);

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.loading.set(true);
    this.api.getTravelExpenses().subscribe({
      next: (res) => {
        if (res.success) this.allItems.set(res.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openApplyModal() {
    this.type = 'Expense';
    this.title = '';
    this.amount = 2500;
    this.category = 'Client Hospitality & Dinner';
    this.desc = '';
    this.attachments.set([]);
    this.showApplyModal.set(true);
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const newFiles: ExpenseAttachment[] = [];
    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i];
      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      newFiles.push({
        name: file.name,
        size: sizeStr,
        type: file.type || 'application/pdf',
        uploadedAt: new Date().toISOString().split('T')[0]
      });
    }

    this.attachments.update(prev => [...prev, ...newFiles]);
    input.value = '';
  }

  addQuickSampleBill(name: string, size: string): void {
    const sample: ExpenseAttachment = {
      name,
      size,
      type: 'application/pdf',
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    this.attachments.update(prev => [...prev, sample]);
  }

  removeAttachment(index: number): void {
    this.attachments.update(prev => prev.filter((_, i) => i !== index));
  }

  openPreview(doc: ExpenseAttachment): void {
    this.previewDoc.set(doc);
  }

  closePreview(): void {
    this.previewDoc.set(null);
  }

  handleCreate() {
    const user = this.currentUser();
    if (!user) return;

    const currentAttachments = this.attachments();

    this.api.createTravelExpense({
      type: this.type,
      employeeId: user.employeeId,
      employeeName: user.name,
      department: user.department,
      title: this.title,
      amount: Number(this.amount),
      date: new Date().toISOString().split('T')[0],
      category: this.category,
      description: this.desc,
      receiptAttachment: currentAttachments.length > 0 ? currentAttachments[0].name : 'Invoice_Receipt.pdf',
      attachments: currentAttachments
    }).subscribe({
      next: (res) => {
        if (res.success && res.item) {
          this.allItems.update(prev => [res.item, ...prev]);
          this.showApplyModal.set(false);
          this.title = '';
          this.desc = '';
          this.attachments.set([]);
        }
      },
      error: (err) => console.error('Failed to create expense claim:', err)
    });
  }
}
