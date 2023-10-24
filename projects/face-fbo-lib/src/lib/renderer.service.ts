import {Injectable} from '@angular/core';
import * as THREE from 'three';
import {RGBAFormat} from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {AfterimagePass} from 'three/examples/jsm/postprocessing/AfterimagePass';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass';
import {FXAAShader} from 'three/examples/jsm/shaders/FXAAShader';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import {BokehPass} from 'three/examples/jsm/postprocessing/BokehPass';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';


@Injectable({
  providedIn: 'root'
})
export class RendererService {
  scene: any
  camera: any;
  clock = new THREE.Clock();
  width: number = 0;
  height: number = 0;
  controls: any;
  renderer: any;
  composer: any;
  container: any
  sketch!: any;
  angle: number = 0;

  constructor() {
    console.log('RendererService');
  }


  setup(container: any) {
    this.container = container;
    // Create the scene and camera
    this.scene = new THREE.Scene();
    this.camera = this.createCamera();
    this.camera.position.z = 15;
    this.camera.position.y = 0;
    this.camera.position.x = 0;

    // this.scene.fog = new THREE.Fog(0x000000, 10, 40);
    // this.scene.background = new THREE.Color(0x000000);


    // const axesHelper = new THREE.AxesHelper(5);
    // this.scene.add(axesHelper);
    const options = {
      minFilter: THREE.NearestFilter,//important as we want to sample square pixels
      magFilter: THREE.NearestFilter,//
      format: RGBAFormat,//could be RGBAFormat
      type: THREE.FloatType, //important as we need precise coordinates (not ints)
      antialias: true
    };
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(0x000000, 0); // Set a transparent background
    this.renderer.alpha = true;
    this.renderer.sortObjects = false;

    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.autoUpdate = true;

    this.container.appendChild(this.renderer.domElement);
    // this.container.addEventListener('click', this.onContainerClick);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    window.addEventListener('resize', this.resize.bind(this));

    this.adjustLighting();

    // this.visObs = new VisObs(visObsCtx);
    // this.tracksController = new TracksController(this, this.visObs);
    this.initComposer();
    this.render();
  }

  initComposer() {

    // const renderScene = new RenderPass(this.scene, this.camera);
    this.composer = new EffectComposer(this.renderer);

    const afterimagePass: any = new AfterimagePass();
    afterimagePass.uniforms['damp'].value = .9;

    const fxaaPass = new ShaderPass(FXAAShader);
    const pixelRatio = this.renderer.getPixelRatio();

    fxaaPass.material.uniforms['resolution'].value.x = 1 / (this.container.offsetWidth * pixelRatio);
    fxaaPass.material.uniforms['resolution'].value.y = 1 / (this.container.offsetHeight * pixelRatio);

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight),
      .5, .01, .95);

    const bokehPass = new BokehPass(this.scene, this.camera, {
      focus: 10,
      aperture: 0.001,
      maxblur: 0.001,
    });
    bokehPass.needsSwap = true;
    bokehPass.renderToScreen = true;


    const renderPass = new RenderPass(this.scene, this.camera);
    // renderPass.clear = false;
    // renderPass.clearDepth = true;
    this.composer.addPass(renderPass);
    // this.composer.addPass(afterimagePass);
    // this.composer.addPass(fxaaPass);
    // this.composer.addPass(bloomPass);
    // this.composer.addPass(bokehPass);

  }

  adjustLighting() {

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff);
    hemiLight.position.set(0, 30, 0);

    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(0, 30, 0);
    dirLight.castShadow = true;
    const frustumSize = 100; // Adjust this value according to your scene's scale

    dirLight.shadow.camera.top = frustumSize;
    dirLight.shadow.camera.bottom = -frustumSize;
    dirLight.shadow.camera.left = -frustumSize;
    dirLight.shadow.camera.right = frustumSize;

    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 1000;
    // dirLight.shadow.bias = 0;

    dirLight.shadow.mapSize.width = 1024; // Adjust according to your needs
    dirLight.shadow.mapSize.height = 1024;

    this.scene.add(hemiLight, dirLight);
  }

  render = () => {
    requestAnimationFrame(this.render);
    const time = this.clock.getElapsedTime();

    if (this.sketch?.isRunning) {
      this.sketch.update(time);
      // this.renderer.render(this.scene, this.camera);
      this.composer.render();

      // this.camera.position.x = 16.5 * Math.cos(this.angle);
      // this.camera.position.z = 16.5 * Math.sin(this.angle);
      // this.camera.lookAt(new THREE.Vector3(0, 0, 0));

      // Increase the angle for the next frame
      this.angle += 0.001;

    }
  }

  createCamera(): any {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    return camera;
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }
}
