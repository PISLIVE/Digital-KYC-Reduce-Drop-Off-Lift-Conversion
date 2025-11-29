<script>
    const state = {
      currentStep: 1,
      maxSteps: 4,
      attempts: {1: 0, 2: 0, 3: 0, 4: 0},
      maxAttempts: 3,
      startedAt: Date.now(),
      docsSelected: { identity: null, address: null },
      rejected: false
    };

    function getTotalAttempts() {
      return state.attempts[1] + state.attempts[2] + state.attempts[3] + state.attempts[4];
    }

    function updateJourneyPanel() {
      const steps = document.querySelectorAll('[data-left-step]');
      steps.forEach(el => {
        const n = parseInt(el.getAttribute('data-left-step'), 10);
        const bullet = el.querySelector('.bullet');
        bullet.className = 'bullet';
        if (n < state.currentStep) {
          bullet.classList.add('completed');
        } else if (n === state.currentStep) {
          bullet.classList.add('active');
        }
      });

      const meta = document.getElementById('journeyMeta');
      const totalAttempts = getTotalAttempts();
      const elapsedSec = Math.round((Date.now() - state.startedAt) / 1000);
      let risk = 'Low';
      if (totalAttempts >= 3 && totalAttempts < 6) risk = 'Medium';
      if (totalAttempts >= 6) risk = 'High';

      meta.innerHTML =
        'Attempts used (all steps): ' + totalAttempts + ' / 12<br />' +
        'KYC risk flag: ' + risk + '<br />' +
        'Status: ' + (state.currentStep <= state.maxSteps ? 'In progress' : (state.rejected ? 'Rejected' : 'Completed'));
    }

    function updateProgress() {
      const progressBar = document.getElementById('progressBar');
      const stepIndicator = document.getElementById('stepIndicator');
      const attemptsInfo = document.getElementById('attemptsInfo');
      const overallInfo = document.getElementById('overallInfo');

      const percent = (state.currentStep - 1) / state.maxSteps * 100;
      progressBar.style.width = percent + '%';

      stepIndicator.textContent = 'Step ' + state.currentStep + ' of ' + state.maxSteps + ' – Digital KYC Journey';

      const used = state.attempts[state.currentStep] || 0;
      attemptsInfo.textContent = 'Attempts used at this step: ' + used + ' / ' + state.maxAttempts;

      const totalAttempts = getTotalAttempts();
      const elapsedSec = Math.round((Date.now() - state.startedAt) / 1000);
      overallInfo.textContent =
        'Total attempts across all steps: ' + totalAttempts +
        ' | Session time: ~' + elapsedSec + ' seconds.';

      updateJourneyPanel();
    }

    function showStep(step) {
      const allSteps = document.querySelectorAll('.step');
      allSteps.forEach(s => s.classList.remove('active'));

      const stepDiv = document.querySelector('.step[data-step="' + step + '"]');
      if (stepDiv) {
        stepDiv.classList.add('active');
      }
      state.currentStep = step;
      if (step <= state.maxSteps) {
        updateProgress();
      } else {
        const progressBar = document.getElementById('progressBar');
        const stepIndicator = document.getElementById('stepIndicator');
        const attemptsInfo = document.getElementById('attemptsInfo');
        progressBar.style.width = '100%';
        stepIndicator.textContent = 'Digital KYC Status';
        attemptsInfo.textContent = '';
        updateJourneyPanel();
      }
    }

    function rejectFlow(reasonText) {
      state.rejected = true;
      const finalDiv = document.getElementById('finalStatus');
      const totalAttempts = getTotalAttempts();
      const totalTimeSec = Math.round((Date.now() - state.startedAt) / 1000);

      finalDiv.innerHTML = `
        <h2 style="color:#b91c1c;">KYC Rejected</h2>
        <div class="status-chip rejected">Decision: Rejected by system</div>
        <p style="margin-top:8px;">${reasonText}</p>
        <table class="summary-table">
          <tr><th>Metric</th><th>Value</th></tr>
          <tr><td>Total attempts</td><td>${totalAttempts}</td></tr>
          <tr><td>Time taken (approx.)</td><td>${totalTimeSec} seconds</td></tr>
          <tr><td>Identity Doc</td><td>${state.docsSelected.identity || '-'}</td></tr>
          <tr><td>Address Doc</td><td>${state.docsSelected.address || '-'}</td></tr>
        </table>
        <p class="hint">
          You have exhausted the maximum allowed attempts or the system flagged multiple issues.
          Please retry after some time or visit the nearest HDFC branch for offline KYC completion.
        </p>
      `;
      showStep(5);
    }

    function approveFlow(reviewNeeded) {
      const finalDiv = document.getElementById('finalStatus');
      const totalAttempts = getTotalAttempts();
      const totalTimeSec = Math.round((Date.now() - state.startedAt) / 1000);

      const reviewChip = reviewNeeded
        ? '<div class="status-chip review">Decision: Approved with post-verification review</div>'
        : '<div class="status-chip">Decision: Straight-through KYC approval</div>';

      finalDiv.innerHTML = `
        <h2 style="color:#15803d;">KYC Approved</h2>
        ${reviewChip}
        <p style="margin-top:8px;">Your digital KYC has been successfully completed.</p>
        <table class="summary-table">
          <tr><th>Metric</th><th>Value</th></tr>
          <tr><td>Total attempts</td><td>${totalAttempts}</td></tr>
          <tr><td>Time taken (approx.)</td><td>${totalTimeSec} seconds</td></tr>
          <tr><td>Identity Doc</td><td>${state.docsSelected.identity || '-'}</td></tr>
          <tr><td>Address Doc</td><td>${state.docsSelected.address || '-'}</td></tr>
        </table>
        <p class="hint">
          This prototype shows how guided UX, attempts visibility and risk-based decisions
          can help HDFC reduce drop-offs and re-submissions in Digital KYC.
        </p>
      `;
      showStep(5);
    }

    function goToPrev() {
      if (state.currentStep > 1 && state.currentStep <= state.maxSteps) {
        showStep(state.currentStep - 1);
      }
    }

    function restartJourney() {
      state.currentStep = 1;
      state.attempts = {1: 0, 2: 0, 3: 0, 4: 0};
      state.startedAt = Date.now();
      state.docsSelected = { identity: null, address: null };
      state.rejected = false;

      // Clear inputs and errors
      document.getElementById('identityDoc').value = '';
      document.getElementById('addressDoc').value = '';
      document.getElementById('passportValidity').value = '';
      document.getElementById('scanConfirm').checked = false;
      document.getElementById('docFile').value = '';
      document.getElementById('duplicateConfirm').checked = false;
      document.getElementById('photoFile').value = '';
      document.getElementById('selfieFile').value = '';
      document.getElementById('faceMatchConfirm').checked = false;

      ['identityError','addressError','passportError','scanError','uploadError',
       'duplicateError','photoError','selfieError','faceMatchError'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '';
      });

      ['msgStep1','msgStep2','msgStep3','msgStep4','loaderStep4'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '';
      });

      const btn4 = document.getElementById('btnStep4');
      btn4.disabled = false;
      btn4.classList.remove('btn-disabled');
      btn4.textContent = 'Complete KYC';

      showStep(1);
    }

    // STEP 1 – relaxed logic: accept PAN / Aadhaar / Passport as identity
function handleStep1() {
  const identityDoc = document.getElementById('identityDoc').value;
  const addressDoc  = document.getElementById('addressDoc').value;
  const passportValidity = document.getElementById('passportValidity').value.trim();
  const msg = document.getElementById('msgStep1');

  // clear per-field errors
  document.getElementById('identityError').textContent = '';
  document.getElementById('addressError').textContent = '';
  document.getElementById('passportError').textContent = '';
  msg.textContent = '';
  msg.className = 'message';

  let valid = true;
  let errors = [];

  // 1) Both dropdowns must be selected
  if (!identityDoc) {
    valid = false;
    document.getElementById('identityError').textContent =
      'Please select a valid identity document (PAN / Aadhaar / Passport).';
    errors.push('Identity document missing.');
  }

  if (!addressDoc) {
    valid = false;
    document.getElementById('addressError').textContent =
      'Please select a valid address document (Aadhaar / Passport / Voter ID).';
    errors.push('Address document missing.');
  }

  const docs = [identityDoc, addressDoc];

  // 2) If Passport is used anywhere, check validity (optional but realistic)
  if (docs.includes('PASSPORT') && passportValidity !== '') {
    const months = Number(passportValidity);
    if (isNaN(months) || months < 6) {
      valid = false;
      document.getElementById('passportError').textContent =
        'Passport should have minimum 6 months validity for KYC.';
      errors.push('Passport validity less than 6 months or invalid input.');
    }
  }

  // 3) Optional: soft reminder about PAN + Aadhaar (does NOT block)
  let advisoryNote = '';
  if (!docs.includes('PAN') || !docs.includes('AADHAAR')) {
    advisoryNote =
      'Note: For fully compliant digital KYC, PAN and Aadhaar will be required later in the process.';
  }

  // If invalid → count attempt and maybe reject
  if (!valid) {
    state.attempts[1] += 1;
    msg.classList.add('error');
    msg.innerHTML = 'Step could not be saved due to:<br>• ' + errors.join('<br>• ');
    updateProgress();

    if (state.attempts[1] >= state.maxAttempts) {
      rejectFlow('Repeated incorrect / incomplete document selection. Step 1 attempts exceeded.');
    }
    return;
  }

  // Save for summary
  state.docsSelected.identity = identityDoc;
  state.docsSelected.address = addressDoc;

  msg.classList.add('success');
  msg.innerHTML =
    'Document selection validated. Moving to scan step.' +
    (advisoryNote ? '<br><span class="hint">' + advisoryNote + '</span>' : '');

  showStep(2);
}


    // STEP 2
    function handleStep2() {
      const scanConfirm = document.getElementById('scanConfirm').checked;
      const msg = document.getElementById('msgStep2');
      const scanError = document.getElementById('scanError');

      scanError.textContent = '';
      msg.textContent = '';
      msg.className = 'message';

      if (!scanConfirm) {
        state.attempts[2] += 1;
        scanError.textContent = 'You must confirm that the scan quality is good before continuing.';
        msg.classList.add('error');
        msg.textContent = 'Scan quality confirmation is pending. Please review the document position and try again.';
        updateProgress();

        if (state.attempts[2] >= state.maxAttempts) {
          rejectFlow('Repeated poor-quality scans or missing scan confirmation. Step 2 attempts exceeded.');
        }
        return;
      }

      msg.classList.add('success');
      msg.textContent = 'Scan quality confirmed. Proceeding to upload stage.';
      showStep(3);
    }

    // STEP 3
    function handleStep3() {
      const docFile = document.getElementById('docFile');
      const duplicateConfirm = document.getElementById('duplicateConfirm').checked;
      const msg = document.getElementById('msgStep3');
      const uploadError = document.getElementById('uploadError');
      const duplicateError = document.getElementById('duplicateError');

      uploadError.textContent = '';
      duplicateError.textContent = '';
      msg.textContent = '';
      msg.className = 'message';

      let valid = true;
      let errors = [];

      if (!docFile || !docFile.files || docFile.files.length === 0) {
        valid = false;
        uploadError.textContent = 'Please upload at least one scanned KYC document file.';
        errors.push('No KYC document file selected.');
      }

      if (!duplicateConfirm) {
        valid = false;
        duplicateError.textContent = 'Please confirm that this document is not a duplicate.';
        errors.push('Duplicate document confirmation not provided.');
      }

      if (!valid) {
        state.attempts[3] += 1;
        msg.classList.add('error');
        msg.innerHTML = 'Upload validation failed due to:<br>• ' + errors.join('<br>• ');
        updateProgress();

        if (state.attempts[3] >= state.maxAttempts) {
          rejectFlow('Repeated upload issues or suspected duplicate document. Step 3 attempts exceeded.');
        }
        return;
      }

      msg.classList.add('success');
      msg.textContent = 'Document uploaded and basic checks cleared. Moving to photo verification.';
      showStep(4);
    }

    // STEP 4
    function handleStep4() {
      const photoFile = document.getElementById('photoFile');
      const selfieFile = document.getElementById('selfieFile');
      const faceMatchConfirm = document.getElementById('faceMatchConfirm').checked;

      const photoError = document.getElementById('photoError');
      const selfieError = document.getElementById('selfieError');
      const faceMatchError = document.getElementById('faceMatchError');

      const msg = document.getElementById('msgStep4');
      const loader = document.getElementById('loaderStep4');
      const btn = document.getElementById('btnStep4');

      photoError.textContent = '';
      selfieError.textContent = '';
      faceMatchError.textContent = '';
      msg.textContent = '';
      loader.textContent = '';
      msg.className = 'message';

      let valid = true;
      let errors = [];

      if (!photoFile || !photoFile.files || photoFile.files.length === 0) {
        valid = false;
        photoError.textContent = 'Passport-size photograph is mandatory.';
        errors.push('Photograph not uploaded.');
      }

      if (!selfieFile || !selfieFile.files || selfieFile.files.length === 0) {
        valid = false;
        selfieError.textContent = 'Real-time selfie is mandatory.';
        errors.push('Selfie not uploaded.');
      }

      if (!faceMatchConfirm) {
        valid = false;
        faceMatchError.textContent = 'Kindly confirm that the selfie matches the photograph.';
        errors.push('Face match confirmation not provided.');
      }

      if (!valid) {
        state.attempts[4] += 1;
        msg.classList.add('error');
        msg.innerHTML = 'Photo verification could not proceed due to:<br>• ' + errors.join('<br>• ');
        updateProgress();

        if (state.attempts[4] >= state.maxAttempts) {
          rejectFlow('Repeated issues in photo/selfie verification. Step 4 attempts exceeded.');
        }
        return;
      }

      msg.classList.add('success');
      msg.textContent = 'Local photo validation passed. Initiating backend KYC decision...';
      loader.textContent = 'Connecting to KYC engine and face-match services (simulated 2–3 seconds)...';

      btn.disabled = true;
      btn.classList.add('btn-disabled');
      btn.textContent = 'Processing...';

      setTimeout(() => {
        const totalAttempts = getTotalAttempts();

        if (totalAttempts >= 6) {
          rejectFlow('Backend KYC engine rejected this application due to high risk (multiple inconsistencies).');
        } else {
          const reviewNeeded = totalAttempts >= 3;
          approveFlow(reviewNeeded);
        }
      }, 2200);
    }

    // Initialize
    updateProgress();
  </script>
</body>
</html>
