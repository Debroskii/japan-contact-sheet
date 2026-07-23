import { CONFIG } from "./config";
import { unloadedImages, fullRes } from "./gallery";
import exifr from 'exifr'

export function buildHeroSection(app) {
    let heroSection = document.createElement("div")
    heroSection.id = "hero-section"

    let heroImg = document.createElement("img")
    heroImg.src = CONFIG.heroImgSrc
    heroImg.id = "hero-img"
    heroSection.appendChild(heroImg)

    let heroTitleContainer = document.createElement("div");
    heroTitleContainer.id = "hero-title-container"

    let heroLogo = document.createElement("img")
    heroLogo.src = new URL("./assets/project_logo.png", import.meta.url).href
    heroLogo.id = "hero-project-logo"
    // heroTitleContainer.appendChild(heroLogo)

    let heroTitle = document.createElement("p")
    heroTitle.innerHTML = CONFIG.project
    heroTitle.id = "hero-project-title"
    createTextObfuscationAnimation(heroTitle)
    heroTitleContainer.appendChild(heroTitle)
    
    heroSection.appendChild(heroTitleContainer);
    app.appendChild(heroSection)
}

export function buildContactSheet(app) {
    let contactSheetDiv = document.createElement("div")
    contactSheetDiv.id = "contact-sheet"

    let headerDiv = document.createElement('div')
    headerDiv.id = "contact-sheet-header"

    let label = document.createElement("p")
    label.id = "contact-sheet-label"
    label.dataset.obfthis = "true"
    label.innerHTML = "CONTACT SHEET"
    obfuscateObserver.observe(label)
    headerDiv.appendChild(label)

    let heading = document.createElement("p")
    heading.id = "contact-sheet-heading"
    heading.dataset.obfthis = "true"
    heading.innerHTML = "Shot by Eli"
    obfuscateObserver.observe(heading)
    headerDiv.appendChild(heading)

    let details = document.createElement("p")
    details.id = "contact-sheet-details"
    details.dataset.obfthis = "true"
    details.innerHTML = "June 22 - July 12"
    obfuscateObserver.observe(details)
    headerDiv.appendChild(details)

    contactSheetDiv.appendChild(headerDiv)
    buildGalleryGrid(contactSheetDiv)

    let sentinal = document.createElement("div")
    sentinal.id = "sentinal"
    sentinal.innerHTML = "End of Contact Sheet"
    appendMoreImagesObserver.observe(sentinal)

    contactSheetDiv.appendChild(sentinal)
    app.appendChild(contactSheetDiv)
}

export function buildGalleryGrid(contactSheet) {
    let gallery = document.createElement("div")
    gallery.id = "gallery"

    let column1 = document.createElement("div")
    column1.id = "gallery-c1"
    column1.dataset.height = 0
    column1.classList.add("gallery-c")
    gallery.appendChild(column1)

    let column2 = document.createElement("div")
    column2.id = "gallery-c2"
    column2.dataset.height = 0
    column2.classList.add("gallery-c")
    gallery.appendChild(column2)

    let column3 = document.createElement("div")
    column3.id = "gallery-c3"
    column3.dataset.height = 0
    column3.classList.add("gallery-c")
    gallery.appendChild(column3)

    distributeImagesIntoColumns(10, column1, column2, column3)

    contactSheet.appendChild(gallery)
}

async function distributeImagesIntoColumns(imageCount, c1, c2, c3) {
  if (imageCount > unloadedImages.length) imageCount = unloadedImages.length;

  for (let i = 0; i < imageCount; i++) {
    let c = getSmallestColumn(c1, c2, c3);

    let image = getRandomItem(unloadedImages); // now { filename, url }
    unloadedImages.splice(unloadedImages.indexOf(image), 1);

    let imgNode = document.createElement("img");
    imgNode.classList.add("gallery-thumbnail");
    imgNode.dataset.filename = image.filename; // <-- stash it, don't parse src later
    c.appendChild(imgNode);

    await new Promise((resolve) => {
      imgNode.onload = resolve;
      imgNode.onerror = resolve;
      imgNode.src = image.url;
    });

    imgNode.animate(
      [
        { transform: "translate(0, 20rem)", opacity: "0" },
        { transform: "translate(0, 0)", opacity: "100%" }
      ],
      { duration: 500, easing: "ease-out", fill: "forwards", iterations: 1 }
    );

    imgNode.onclick = () => buildPlayback(imgNode);

    c.dataset.height = Number(c.dataset.height) + imgNode.offsetHeight;
  }
}

async function buildPlayback(imgNode) {
  const name = imgNode.dataset.filename;
  const importFn = fullRes[`/src/images/${name}`];

  if (!importFn) {
    console.warn('No full-res match for', name);
    return;
  }

  const mod = await importFn(); // fetch happens now, not before
  const fullURL = mod.default;

  const app = document.getElementById("app");
  document.body.classList.add("overlay-active")

  let playbackContainer = document.createElement("div")
  playbackContainer.id = "playback-container"

  playbackContainer.addEventListener('click', (event) => event.stopPropagation());
  playbackContainer.addEventListener('touchmove', (event) => event.preventDefault(), { passive: false });

  let top = document.createElement("div")
  top.id = "playback-top"

  let filenameLabel = document.createElement("p")
  filenameLabel.innerHTML = name
  filenameLabel.id = "playback-filename"
  top.appendChild(filenameLabel)

  let closeBtn = document.createElement("button")
  closeBtn.innerHTML = `<span class="material-symbols-sharp">close</span>`
  closeBtn.id = "playback-close"
  closeBtn.onclick = () => {
    playbackContainer.remove()
    document.body.classList.remove("overlay-active")
  }

  let downloadBtn = document.createElement("button")
  downloadBtn.innerHTML = `<span class="material-symbols-sharp">download</span>`
  downloadBtn.id = "playback-download"

  top.appendChild(downloadBtn)
  top.appendChild(closeBtn)
  playbackContainer.appendChild(top)

  let playbackImg = document.createElement("img")
  playbackImg.id = "playback-img";
  playbackImg.src = fullURL
  playbackContainer.appendChild(playbackImg)

  let bottom = document.createElement("div")
  bottom.id = "playback-bottom"

  let exifData = await getExifData(playbackImg);

  let camera = document.createElement("p")
  camera.classList.add("playback-bottom-info")
  camera.innerHTML = exifData.Model
  bottom.appendChild(camera)

  let focalL = document.createElement("p")
  focalL.classList.add("playback-bottom-info")
  focalL.innerHTML = exifData.FocalLength + "mm"
  bottom.appendChild(focalL)

  let shutterSpeed = document.createElement("p")
  shutterSpeed.classList.add("playback-bottom-info")
  shutterSpeed.innerHTML = decimalToShutterFraction(exifData.ExposureTime)
  bottom.appendChild(shutterSpeed)

  let fnum = document.createElement("p")
  fnum.classList.add("playback-bottom-info")
  fnum.innerHTML = "f" + exifData.FNumber
  bottom.appendChild(fnum)

  let iso = document.createElement("p")
  iso.classList.add("playback-bottom-info")
  iso.innerHTML = exifData.ISO + " ISO"
  bottom.appendChild(iso)

  downloadBtn.onclick = () => downloadImageFromNode(playbackImg, name)

  playbackContainer.appendChild(bottom)
  app.appendChild(playbackContainer)
}

async function downloadImageFromNode(imgNode, fileName = 'download.jpg') {
  try {
    // 1. Fetch the image content directly
    const response = await fetch(imgNode.src);
    const blob = await response.blob();
    
    // 2. Create a temporary local URL for the blob data
    const blobUrl = URL.createObjectURL(blob);
    
    // 3. Create a hidden anchor element to trigger download
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    
    // 4. Append, click, and clean up the link
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 5. Free up memory allocations
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download failed:', error);
  }
}

function getSmallestColumn(c1, c2, c3) {
  let columns = [c1, c2, c3]
  let smallest = columns.reduce((min, item) => (Number(item.dataset.height) < Number(min.dataset.height) ? item : min));
  return smallest
}

function decimalToShutterFraction(decimal) {
  if (decimal <= 0) return "0";
  
  // Calculate the multiplier to turn the decimal into a whole number
  // E.g., 0.0025 becomes 1/400
  const tolerance = 1.0e-9;
  let numerator = 1;
  let denominator = Math.round(1 / decimal);
  
  // Find the greatest common divisor to simplify the fraction
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  let commonDivisor = gcd(numerator, denominator);
  
  // Simplify
  numerator = numerator / commonDivisor;
  denominator = denominator / commonDivisor;
  
  return `${numerator}/${denominator}`;
}

async function getExifData(img) {
    try {
      // Pass the image URL directly into the parse function
      const data = await exifr.parse(img);

      return data;
    } catch (error) {
      console.error('Error reading EXIF data:', error);
    }
  }

export const getRandomItem = arr => arr[Math.floor(Math.random() * arr.length)];
const splitAt = (str, index) => [str.slice(0, index), str.slice(index)];
function getRandomAscii() {
    const asciiCode = Math.floor(Math.random() * 94) + 33;
    return String.fromCharCode(asciiCode);
}

export function createTextObfuscationAnimation(element) {
    let originalText = element.innerHTML;
    let currentText = ""

    let iteCount = 0;
    element.innerHTML = ""
    let loop = setInterval(() => {
        if(iteCount > 20) {
            element.innerHTML = currentText
            iteCount = 0;
            let split = splitAt(originalText, 1);
            currentText = currentText + split[0]
            originalText = split[1]
            if(originalText.length == 0) { clearInterval(loop); element.innerHTML = currentText; return; }
        }
        element.innerHTML = currentText + getRandomAscii()
        iteCount++;
    }, 5)
}

const obfuscateObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        createTextObfuscationAnimation(entry.target)
      }
    });
  });

const appendMoreImagesObserver = new IntersectionObserver((entries) => {
  entries.forEach(async entry => {
    if (entry.isIntersecting) {
      await distributeImagesIntoColumns(9, document.getElementById("gallery-c1"), document.getElementById("gallery-c2"), document.getElementById("gallery-c3"))
    }
  });
})