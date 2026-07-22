import { buildContactSheet, buildHeroSection } from "./components";
import { CONFIG } from "./config";
import { stopLoadingAnim } from "./loading";

export const images = Object.values(import.meta.glob('/src/images/thumbnails/*.{png,jpg,jpeg,svg}', { 
    eager: true, 
    as: 'url'
}));

export let unloadedImages = [...images]
export let loadedImages = []

export let loadingBufferStatus = {
    bufferImages: [],
    bufferImagesLoaded: 0
}

export function buildLoadingBuffer() {
    let bufferContainer = document.createElement("div");
    for(let imageURL of images) {
        let img  = document.createElement("img")
        img.src = imageURL;
        img.onload = () => {
            loadingBufferStatus.bufferImagesLoaded++;
            document.getElementById("loading-status").innerHTML = `${stringifyNumberToHaveSameDigitsAsMax(loadingBufferStatus.bufferImagesLoaded)} / ${images.length}`
            if(loadingBufferStatus.bufferImagesLoaded == images.length) {
                setupGallery()
            }
        }
        loadingBufferStatus.bufferImages.push(img);
        bufferContainer.appendChild(img)
    }
    let img  = document.createElement("img")
    img.src = "/src/assets/July-10-42.jpg";
    img.onload = () => {
        loadingBufferStatus.bufferImagesLoaded++;
        document.getElementById("loading-status").innerHTML = `${stringifyNumberToHaveSameDigitsAsMax(loadingBufferStatus.bufferImagesLoaded)} / ${images.length}`
        if(loadingBufferStatus.bufferImagesLoaded == images.length) {
            setupGallery()
        }
    }
    loadingBufferStatus.bufferImages.push(img);
    bufferContainer.appendChild(img)
}

export function stringifyNumberToHaveSameDigitsAsMax(number, max) {
    let num = `${number}`
    let src = `${max}`
    let diff = src.length - num.length
    num.padStart(diff, "0")
    return num
}

const app = document.getElementById("app");
let loadingCube = document.querySelector(".loading-cube")

export function setupGallery() {
    stopLoadingAnim()
    loadingCube = document.querySelector(".loading-cube")
    loadingCube.getAnimations().forEach(a => a.cancel()); // clear any stragglers
    app.innerHTML = ``
    app.appendChild(loadingCube)
    buildColorTransitionOrb()
}

function buildColorTransitionOrb() {
    let newanim = loadingCube.animate(
    [
        { transform: "translate(-50%, -50%)", borderRadius: "0"},
        { transform: "translate(-50%, -50%)", borderRadius: "50%"}
    ],
    {
        duration: 250,
        iterations: 1,
        fill: 'forwards',
        easing: 'ease-out'
    })

    newanim.onfinish = () => {
        setTimeout(() => {
            let coverAnim = loadingCube.animate(
                [
                    { transform: "translate(-50%, -50%) scale(1)" },
                    { transform: "translate(-50%, -50%) scale(100)" }
                ],
                {
                    duration: 1000,
                    iterations: 1,
                    fill: 'forwards',
                    easing: 'ease-in'
            })
            
            coverAnim.onfinish = pageTransition;
        }, 500)
    };
}

function pageTransition() {
    loadingCube.remove()
    document.querySelector("*").setAttribute("style", `--bg: ${CONFIG.background_color}; --ink: ${CONFIG.ink_color};`);
    makeGallery();
}

function makeGallery() {
    buildHeroSection(app)
    buildContactSheet(app)
}