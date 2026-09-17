/*
  PhotoConverter
  - getSpec(): () => { width, height, maxKB, format, note }
    width/height/maxKB가 null이면 해당 제약 없이 처리합니다.
  - 모든 처리는 브라우저 내 Canvas API로만 이루어지며 서버 전송이 없습니다.
*/
window.PhotoConverter = (function () {
  const QUALITY_STEPS = [0.92, 0.85, 0.78, 0.7, 0.62, 0.54, 0.46, 0.38, 0.3, 0.22, 0.15, 0.1];

  function fmtKB(bytes) {
    return (bytes / 1024).toFixed(0) + ' KB';
  }

  function drawCover(canvas, img, targetW, targetH) {
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    const srcRatio = img.width / img.height;
    const dstRatio = targetW / targetH;
    let sx, sy, sw, sh;
    if (srcRatio > dstRatio) {
      sh = img.height;
      sw = sh * dstRatio;
      sx = (img.width - sw) / 2;
      sy = 0;
    } else {
      sw = img.width;
      sh = sw / dstRatio;
      sx = 0;
      sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
  }

  function drawOriginal(canvas, img) {
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0);
  }

  function canvasToBlob(canvas, mime, quality) {
    return new Promise(resolve => canvas.toBlob(resolve, mime, quality));
  }

  async function compressToTarget(canvas, mime, maxKB) {
    if (mime !== 'image/jpeg' || !maxKB) {
      return canvasToBlob(canvas, mime, 0.92);
    }
    const maxBytes = maxKB * 1024;
    let best = null;
    for (const q of QUALITY_STEPS) {
      const blob = await canvasToBlob(canvas, mime, q);
      if (!best) best = blob;
      if (blob.size <= maxBytes) return blob;
      best = blob;
    }
    return best;
  }

  function init(getSpec) {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const previewWrap = document.getElementById('previewWrap');
    const previewImg = document.getElementById('previewImg');
    const origSizeEl = document.getElementById('origSize');
    const convSizeEl = document.getElementById('convSize');
    const statusBadge = document.getElementById('statusBadge');
    const downloadBtn = document.getElementById('downloadBtn');
    const statusMsg = document.getElementById('statusMsg');
    const canvas = document.getElementById('workCanvas');

    let currentBlob = null;
    let currentFilename = 'photo.jpg';

    function resetResult() {
      previewWrap.style.display = 'none';
      origSizeEl.textContent = '—';
      convSizeEl.textContent = '—';
      statusBadge.innerHTML = '—';
      downloadBtn.disabled = true;
      statusMsg.textContent = '';
      statusMsg.className = 'status-msg';
      currentBlob = null;
    }

    async function handleFile(file) {
      if (!file || !file.type.startsWith('image/')) {
        statusMsg.textContent = '이미지 파일만 업로드할 수 있습니다.';
        statusMsg.className = 'status-msg error';
        return;
      }

      const spec = getSpec();
      if (spec.requireKB && !spec.maxKB) {
        statusMsg.textContent = '최대 용량(KB)을 입력해 주세요.';
        statusMsg.className = 'status-msg error';
        return;
      }

      statusMsg.textContent = '변환 중...';
      statusMsg.className = 'status-msg';

      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = async () => {
        if (spec.width && spec.height) {
          drawCover(canvas, img, spec.width, spec.height);
        } else {
          drawOriginal(canvas, img);
        }

        const blob = await compressToTarget(canvas, spec.format, spec.maxKB);
        currentBlob = blob;

        const ext = spec.format === 'image/png' ? 'png' : 'jpg';
        currentFilename = `photo_${canvas.width}x${canvas.height}.${ext}`;

        origSizeEl.textContent = fmtKB(file.size);
        convSizeEl.textContent = fmtKB(blob.size);

        const passed = !spec.maxKB || blob.size <= spec.maxKB * 1024;
        statusBadge.innerHTML = passed
          ? '<span class="badge ok">규격 통과</span>'
          : '<span class="badge fail">용량 초과 — 원본 화질 한계</span>';

        previewImg.src = URL.createObjectURL(blob);
        previewWrap.style.display = 'block';
        downloadBtn.disabled = false;

        statusMsg.textContent = passed
          ? '완료되었습니다. 다운로드 후 제출 전 실제 화면에서 다시 확인하세요.'
          : '목표 용량에 맞추지 못했습니다. 원본 해상도가 낮거나 사진이 복잡한 경우일 수 있습니다.';
        statusMsg.className = 'status-msg';

        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        statusMsg.textContent = '이미지를 불러오지 못했습니다. 다른 파일로 시도해 주세요.';
        statusMsg.className = 'status-msg error';
      };
      img.src = url;
    }

    downloadBtn.addEventListener('click', () => {
      if (!currentBlob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(currentBlob);
      a.download = currentFilename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    });

    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', e => handleFile(e.target.files[0]));

    ['dragenter', 'dragover'].forEach(evt =>
      dropzone.addEventListener(evt, e => { e.preventDefault(); dropzone.classList.add('drag'); })
    );
    ['dragleave', 'drop'].forEach(evt =>
      dropzone.addEventListener(evt, e => { e.preventDefault(); dropzone.classList.remove('drag'); })
    );
    dropzone.addEventListener('drop', e => handleFile(e.dataTransfer.files[0]));

    resetResult();
  }

  return { init, fmtKB };
})();
