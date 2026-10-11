/* ==========================================
   FILTERS
========================================== */

document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.schedule-section button');
  const table = document.querySelector('.schedule-table');
  const allCells = table.querySelectorAll('tbody td');

  // Create message element if not present
  let messageDiv = document.querySelector('.schedule-message');
  if (!messageDiv) {
    messageDiv = document.createElement('div');
    messageDiv.className = 'schedule-message';
    messageDiv.style.display = 'none';
    messageDiv.textContent = 'Žiadne položky na zobrazenie.';
    table.parentNode.insertBefore(messageDiv, table.nextSibling);
  }

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      // Manage active button class
      buttons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const filterText = button.textContent.trim();
      let visibleCount = 0;

      allCells.forEach(cell => {
        // Skip hour column (first cell in row)
        if (cell.parentNode.children[0] === cell) {
          return;
        }

        const isLecture = cell.classList.contains('schedule-lecture');
        const isSeminar = cell.classList.contains('schedule-seminar');
        const isPe = cell.classList.contains('schedule-pe');
        const hasContent = cell.textContent.trim() !== '';

        let show = false;

        if (filterText === 'VŠETKO') {
          show = true;
          if (hasContent) {
            visibleCount++;
          }
        } else if (filterText === 'PREDNÁŠKY') {
          show = isLecture;
          if (isLecture) {
            visibleCount++;
          }
        } else if (filterText === 'CVIČENIA') {
          show = isSeminar || isPe;
          if (isSeminar || isPe) {
            visibleCount++;
          }
        }

        // Toggle visibility instead of display to preserve table structure
        if (show) {
          cell.style.visibility = 'visible';
        } else {
          cell.style.visibility = 'hidden';
        }
      });

      // Show message if no items match
      if (visibleCount === 0) {
        table.style.display = 'none';
        messageDiv.style.display = 'block';
      } else {
        table.style.display = '';
        messageDiv.style.display = 'none';
      }
    });
  });
});


/* ==========================================
   PROGRESS BAR
========================================== */

const TODAY = new Date();
const SEMESTER_START = new Date("2026-09-14");
const SEMESTER_END = new Date("2026-12-11");
const semesterDuration = SEMESTER_END - SEMESTER_START;
const semesterElapsedDuration = TODAY - SEMESTER_START;
const semesterPercentage = (semesterElapsedDuration / semesterDuration) * 100; 
const progressBar = document.getElementById("semester-progress-bar");
progressBar.value = semesterPercentage;
const percentageText = document.getElementById("semester-percentage-text");
percentageText.textContent = `${semesterPercentage.toFixed(0)}%`;