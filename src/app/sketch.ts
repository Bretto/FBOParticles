import {RendererService} from './renderer.service';
import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  DataTexture,
  DoubleSide,
  IcosahedronGeometry,
  Points,
  RepeatWrapping,
  Scene,
  ShaderMaterial,
  Vector4
} from 'three';
import {GPUComputationRenderer, Variable} from 'three/examples/jsm/misc/GPUComputationRenderer';
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader';

// @ts-ignore
import vertex from './shaders/vertex-particles.glsl';
// @ts-ignore
import fragment from './shaders/fragment-particles.glsl';
// @ts-ignore
// import fragmentSimulation from './shaders/fragment-simulation.glsl';
// @ts-ignore
import fragmentSimulation2 from './shaders/fragment-simulation2.glsl';
import gsap from 'gsap';


export class Sketch {

  currentShape: any;
  scene!: Scene;
  isRunning: boolean = true;
  gpuCompute!: GPUComputationRenderer;
  WIDTH = 624;
  dtPosition1!: DataTexture;
  dtPosition2!: DataTexture;
  positionVariable!: Variable;
  material!: any;
  maxDistance = 1.99;
  frequency = .5;
  amplitude = 1.5;

  faceTexture!: DataTexture;
  sphereTexture!: DataTexture;
  boxTexture!: DataTexture;

  normalizedTime: number = 0; // A variable to store the normalized time (between 0 and 1)
  initTexture!: DataTexture;
  current: any;
  private geoFace: any;
  private currentTexture: any;

  constructor(private renderer: RendererService) {
    console.log('Sketch');
    this.scene = renderer.scene;
    // const axesHelper = new AxesHelper( 5 );
    // this.scene.add( axesHelper );

    this.initGpuCompute();
    this.addMesh();

    // const t = gsap.to(this, {
    //   normalizedTime: 1, duration: 10,
    //   ease: 'power3.inOut', repeat: -1, yoyo: true,
    //   onRepeat: () => {
    //     if (!this.positionVariable) return;
    //     // this.fillPositionTexture(this.dtPosition1, new IcosahedronGeometry(7, 50));
    //     const size = Math.random() * 7 + 3;
    //     const segments = Math.floor(Math.random() * 50) + 10;
    //     this.boxTexture = this.createTexture(this.gpuCompute, new BoxGeometry(size, size, size, segments, segments, segments));
    //     this.sphereTexture = this.createTexture(this.gpuCompute, new IcosahedronGeometry(size, segments));
    //     const textures = [this.faceTexture, this.boxTexture, this.sphereTexture, this.boxTexture, this.faceTexture];
    //     const texture = textures[Math.floor(Math.random() * textures.length)];
    //     this.positionVariable.material.uniforms['positionTexture2'] = {value: texture};
    //     // this.gpuCompute.init();
    //   }
    // });

    // this.addFace();
    // this.addSphere();
  }

  async addMesh() {

    const geometry = new BufferGeometry();
    let positions = new Float32Array(this.WIDTH * this.WIDTH * 3);
    let reference = new Float32Array(this.WIDTH * this.WIDTH * 2);
    for (let i = 0; i < this.WIDTH * this.WIDTH; i++) {
      let x = Math.random();
      let y = Math.random();
      let z = Math.random();
      let xx = (i % this.WIDTH) / this.WIDTH;
      let yy = (i / this.WIDTH) / this.WIDTH;
      positions.set([x, y, z], i * 3);
      reference.set([xx, yy], i * 2);
    }

    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('reference', new BufferAttribute(reference, 2));

    this.material = new ShaderMaterial({
      extensions: {
        derivatives: true
      },
      uniforms: {
        time: {value: 0},
        positions: {value: null},
        resolution: {value: new Vector4()},
        particleSpeed: {value: 2}
      },
      blending: AdditiveBlending,
      depthTest: true,
      depthWrite: false,
      transparent: true,
      side: DoubleSide,
      vertexShader: vertex,
      fragmentShader: fragment,
      vertexColors: true
    });

    const mesh = new Points(geometry, this.material);
    this.scene.add(mesh);
  }

  addSphere() {
    const geometry = new IcosahedronGeometry(1, 10);
    let positions = new Float32Array(this.WIDTH * this.WIDTH * 3);
    let reference = new Float32Array(this.WIDTH * this.WIDTH * 2);

    let vertexData = geometry.getAttribute('position').array;
    for (let i = 0; i < this.WIDTH * this.WIDTH; i++) {
      // Pick a random vertex from the geometry
      let vertexIndex = Math.floor(Math.random() * (vertexData.length / 3));

      positions[i * 3] = vertexData[vertexIndex * 3] / 20 + 0.5; // Normalize to [0,1]
      positions[i * 3 + 1] = vertexData[vertexIndex * 3 + 1] / 20 + 0.5; // Normalize to [0,1]
      positions[i * 3 + 2] = vertexData[vertexIndex * 3 + 2] / 20 + 0.5; // Normalize to [0,1]
      reference.set([(i % this.WIDTH) / this.WIDTH, (i / this.WIDTH) / this.WIDTH], i * 2);
    }

    // for (let i = 0; i < this.WIDTH * this.WIDTH; i++) {
    //   let x = Math.random();
    //   let y = Math.random();
    //   let z = Math.random();
    //   let xx = Math.random();//(i % this.WIDTH) / this.WIDTH;
    //   let yy = Math.random();//(i / this.WIDTH) / this.WIDTH;
    //   positions.set([x, y, z], i * 3);
    //   reference.set([xx, yy], i * 2);
    // }
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('reference', new BufferAttribute(reference, 2));
    this.material = new ShaderMaterial({
      extensions: {
        derivatives: true
      },
      uniforms: {
        time: {value: 0},
        positionTexture1: {value: null},
        positionTexture2: {value: null},
        resolution: {value: new Vector4()},
      },
      side: DoubleSide,
      vertexShader: vertex,
      fragmentShader: fragment
    });
    // this.material = new MeshBasicMaterial({color: 0xff0000, wireframe: true});

    const sphere = new Points(geometry, this.material);
    this.scene.add(sphere);
  }

  async addFace() {

    const face = await this.loadObj('assets/face.obj');
    const geo = face.children[0].geometry;


    this.material = new ShaderMaterial({
      extensions: {
        derivatives: true
      },
      uniforms: {
        time: {value: 0},
        positionTexture1: {value: null},
        positionTexture2: {value: null},
        resolution: {value: new Vector4()},
      },
      side: DoubleSide,
      vertexShader: vertex,
      fragmentShader: fragment
    });

    const mesh = new Points(geo, this.material);
    this.scene.add(mesh);
  }

  async initGpuCompute() {

    this.gpuCompute = new GPUComputationRenderer(this.WIDTH, this.WIDTH, this.renderer.renderer);

    const face = await this.loadObj('assets/face.obj');
    this.geoFace = face.children[0].geometry;

    this.faceTexture = this.createTexture(this.gpuCompute, this.geoFace);
    this.boxTexture = this.createTexture(this.gpuCompute, new BoxGeometry(10, 10, 10, 50, 50, 50));
    this.sphereTexture = this.createTexture(this.gpuCompute, new IcosahedronGeometry(7, 50));
    this.initTexture = this.faceTexture;
    // this.faceTexture = this.gpuCompute.createTexture();
    // this.fillPositionTexture(this.faceTexture, geoTest);
    // this.faceTexture.wrapS = RepeatWrapping;
    // this.faceTexture.wrapT = RepeatWrapping;
    //
    //
    // this.boxTexture = this.gpuCompute.createTexture();
    // this.fillPositionTexture(this.boxTexture, new BoxGeometry(10, 10, 10, 50, 50, 50));
    // this.boxTexture.wrapS = RepeatWrapping;
    // this.boxTexture.wrapT = RepeatWrapping;
    //
    //
    // this.sphereTexture = this.gpuCompute.createTexture();
    // this.fillPositionTexture(this.sphereTexture, new IcosahedronGeometry(7, 50));
    // this.sphereTexture.wrapS = RepeatWrapping;
    // this.sphereTexture.wrapT = RepeatWrapping;


    // this.fillPositionTexture(this.dtPosition2, new IcosahedronGeometry(7, 50));

    // const face = await this.loadObj('assets/face.obj');
    // const geoTest = face.children[0].geometry;
    // this.fillPositionTexture(this.dtPosition2, geoTest);

    // Add only one variable
    this.positionVariable = this.gpuCompute.addVariable('positionTexture', fragmentSimulation2, this.initTexture);

    // Add both textures as uniforms
    this.positionVariable.material.uniforms['positionTexture1'] = {value: this.initTexture};
    this.positionVariable.material.uniforms['positionTexture2'] = {value: this.initTexture};

    // Other uniforms
    this.positionVariable.material.uniforms['time'] = {value: 0.0};
    this.positionVariable.material.uniforms['normalizedTime'] = {value: 0.0};
    this.positionVariable.material.uniforms['particleSpeed'] = {value: 1.0};
    this.positionVariable.material.uniforms['frequency'] = {value: this.frequency};
    this.positionVariable.material.uniforms['amplitude'] = {value: this.amplitude};
    this.positionVariable.material.uniforms['maxDistance'] = {value: this.maxDistance};

    this.gpuCompute.init();
  }

  createTexture(gpuCompute: GPUComputationRenderer, geometry: BufferGeometry) {
    let dtPosition = gpuCompute.createTexture();
    this.fillPositionTexture(dtPosition, geometry);
    dtPosition.wrapS = RepeatWrapping;
    dtPosition.wrapT = RepeatWrapping;
    return dtPosition;
  }

  update(time: number) {

    // this.positionVariable.material.uniforms['time'] = {value: time};
    if (!this.positionVariable) return;
    this.positionVariable.material.uniforms['time'].value = time;
    this.positionVariable.material.uniforms['normalizedTime'].value = this.normalizedTime;
    this.positionVariable.material.uniforms['frequency'].value = this.frequency;
    this.positionVariable.material.uniforms['amplitude'].value = this.amplitude;

    this.gpuCompute.compute();
    this.material.uniforms['positions'].value = this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture;
    // this.material.uniforms['positionTexture2'].value = this.gpuCompute.getCurrentRenderTarget(this.positionVariable2).texture;
    // this.material.uniforms['time'].value = normalizedTime;
    // console.log(normalizedTime);

    // this.positionVariable.material.uniforms['amplitude'] = {value: this.amplitude};
    // this.positionVariable.material.uniforms['frequency'] = {value: this.frequency};


    // this.material.uniforms['time'].value = time;
    // this.material.uniforms['particleSpeed'].value = 2.0;
  }

  fillPositionTexture(dtPosition: DataTexture, geometry: any) {

    let arr = dtPosition.image.data;

    let vertexData = geometry.getAttribute('position').array;

    for (let i = 0; i < arr.length; i += 4) {
      let vertexIndex = Math.floor(Math.random() * (vertexData.length / 3));
      arr[i + 0] = vertexData[vertexIndex * 3]; // Normalize to [0,1]
      arr[i + 1] = vertexData[vertexIndex * 3 + 1]; // Normalize to [0,1]
      arr[i + 2] = vertexData[vertexIndex * 3 + 2]; // Normalize to [0,1]
      arr[i + 3] = 1;
    }
    dtPosition.needsUpdate = true;
  }

  loadObj(url: string): Promise<any> {
    const loader = new OBJLoader();
    return new Promise((resolve, reject) => {
      return loader.load(
        url,
        (res) => {
          resolve(res);
        },
        (xhr) => {
          // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (error) => {
          console.log('An error happened');
          reject();
        });
    });
  }

  morth() {

    // maxDistance = 1.99;
    // frequency = .5;
    // amplitude = 1.5;

    this.normalizedTime = 0;
    const obj = {
      normalizedTime: 0,
      amplitude: .31,
      frequency: .5,
    };
    gsap.to(obj, {
      normalizedTime: 1,
      amplitude: 1.8,
      frequency: .25
      , duration: 2,
      ease: 'power3.inOut',
      // repeat: -1,
      // yoyo: true,
      onRepeat: () => {
        // if (!this.positionVariable) return;
        // // this.fillPositionTexture(this.dtPosition1, new IcosahedronGeometry(7, 50));
        // const size = Math.random() * 7 + 3;
        // const segments = Math.floor(Math.random() * 50) + 10;
        // this.boxTexture = this.createTexture(this.gpuCompute, new BoxGeometry(size, size, size, segments, segments, segments));
        // this.sphereTexture = this.createTexture(this.gpuCompute, new IcosahedronGeometry(size, segments));
        // const textures = [this.faceTexture, this.boxTexture, this.sphereTexture, this.boxTexture, this.faceTexture];
        // const texture = textures[Math.floor(Math.random() * textures.length)];
        // this.positionVariable.material.uniforms['positionTexture2'] = {value: texture};
        // this.gpuCompute.init();
      },
      onUpdate: () => {
        this.normalizedTime = obj.normalizedTime;
        this.amplitude = obj.amplitude;
        this.frequency = obj.frequency;
      },
      onComplete: () => {
        this.positionVariable.material.uniforms['positionTexture1'] = {value: this.currentTexture};
        // this.gpuCompute.init();
      }
    });
  }

  onSphere() {
    const size = Math.random() * 3 + 6;
    const segments = Math.floor(Math.random() * 50) + 10;
    this.sphereTexture = this.createTexture(this.gpuCompute, new IcosahedronGeometry(size, segments));
    this.positionVariable.material.uniforms['positionTexture2'] = {value: this.sphereTexture};
    this.currentTexture = this.sphereTexture;
    this.morth();
  }

  onCube() {
    const size = Math.random() * 5 + 10;
    const segments = Math.floor(Math.random() * 50) + 10;
    this.boxTexture = this.createTexture(this.gpuCompute, new BoxGeometry(size, size, size, segments, segments, segments));
    this.positionVariable.material.uniforms['positionTexture2'] = {value: this.boxTexture};
    this.currentTexture = this.boxTexture;
    this.morth();
  }

  onFace() {
    this.faceTexture = this.createTexture(this.gpuCompute, this.geoFace);
    this.positionVariable.material.uniforms['positionTexture2'] = {value: this.faceTexture};
    this.currentTexture = this.faceTexture;
    this.morth();
  }
}
