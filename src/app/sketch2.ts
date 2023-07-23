import {RendererService} from './renderer.service';
import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  DataTexture,
  DoubleSide,
  IcosahedronGeometry, Line, LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial,
  Points,
  RepeatWrapping,
  Scene,
  ShaderMaterial, Vector3,
  Vector4
} from 'three';
import {GPUComputationRenderer, Variable} from 'three/examples/jsm/misc/GPUComputationRenderer';
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader';

// @ts-ignore
import vertex from './shaders/vertex-particles.glsl';
// @ts-ignore
import fragment from './shaders/fragment-particles.glsl';
// @ts-ignore
import fragmentSimulation from './shaders/fragment-simulation.glsl';
// @ts-ignore
import fragmentSimulation2 from './shaders/fragment-simulation2.glsl';
import gsap from 'gsap';


export class Sketch {

  scene!: Scene;
  isRunning: boolean = true;
  gpuCompute!: GPUComputationRenderer;
  WIDTH = 424;
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
  faceGeometry!: BufferGeometry;
  particleSpeed: number = 1.0;
  delta: number = 0.0;

  points!: Points;
  lines!: any;
  initTexture!: DataTexture;

  constructor(private renderer: RendererService) {
    console.log('Sketch');

    // const axesHelper = new AxesHelper( 5 );
    // this.scene.add( axesHelper );

    this.preload();
    const obj = {
      amplitude: 1.5,
      frequency: 0.5,
    };

    const t = gsap.to(obj, {
      amplitude: 1.8,
      frequency: .25, duration: 7,
      ease: 'power3.inOut', repeat: -1, yoyo: true,
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
        // // this.gpuCompute.init();
      },
      onUpdate: () => {
        this.amplitude = obj.amplitude;
        this.frequency = obj.frequency;
      }
    });

    // const t = gsap.to(this, {
    //   normalizedTime: 1, duration: 4,
    //   ease: 'power3.inOut', repeat: -1, yoyo: true,
    //   onRepeat: () => {
    //     // if (!this.positionVariable) return;
    //     // // this.fillPositionTexture(this.dtPosition1, new IcosahedronGeometry(7, 50));
    //     // const size = Math.random() * 7 + 3;
    //     // const segments = Math.floor(Math.random() * 50) + 10;
    //     // this.boxTexture = this.createTexture(this.gpuCompute, new BoxGeometry(size, size, size, segments, segments, segments));
    //     // this.sphereTexture = this.createTexture(this.gpuCompute, new IcosahedronGeometry(size, segments));
    //     // const textures = [this.faceTexture, this.boxTexture, this.sphereTexture, this.boxTexture, this.faceTexture];
    //     // const texture = textures[Math.floor(Math.random() * textures.length)];
    //     // this.positionVariable.material.uniforms['positionTexture2'] = {value: texture};
    //     // // this.gpuCompute.init();
    //   }
    // });

    // this.addFace();
    // this.addSphere();
  }

  init() {
    this.scene = this.renderer.scene;
    this.initGpuCompute();
    // this.positionVariable.material.uniforms['origins'].value = this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture;
    this.addMesh();
    this.addLines();
  }

  async preload() {
    const face = await this.loadObj('assets/face.obj');
    this.faceGeometry = face.children[0].geometry;
    this.init();
  }

  addLines(): void {
    const geometry = new BufferGeometry();

    // Get the positions array
    const positionsData = this.points.geometry.attributes['position'].array;
    // console.log(this.material.uniforms['positions'].value.image);
    // Define the size of your world
    // debugger

    // Create an array to store our new positions
    let position = new Float32Array(positionsData);  // note the * 2

    // Create an array of vectors from the positions data

    for (let i = 0; i < position.length; i += 3) {
      let vertexIndex = Math.floor(Math.random() * (positionsData.length / 3));
      position[i];// *= 10; // Normalize to [0,1]
      position[i + 1];// *= 10; // Normalize to [0,1]
      position[i + 2];// *= 10; // Normalize to [0,1]
    }

    // // Sort vectors by y-coordinate
    // position.sort((a, b) => a.y - b.y);
    //
    // // Loop through the sorted vectors and set the new positions
    // for (let i = 0; i < vectors.length; i++) {
    //   position.set([vectors[i].x, vectors[i].y, vectors[i].z], i * 3);
    // }

    geometry.setAttribute('position', new BufferAttribute(position, 3));

    const material = new LineBasicMaterial({
      color: '#006666',
      // blending: AdditiveBlending,
      depthTest: true,
      depthWrite: false,
      transparent: true,
      opacity: 0.0065,
      side: DoubleSide,
    });

    const mesh = new Line(geometry, material);
    // mesh.translateY(-5);
    // mesh.translateX(-5);
    // mesh.translateZ(-5);

    // mesh.v.needsUpdate = true;
    this.lines = mesh;
    this.scene.add(mesh);
  }


  // addLines(): void {
  //   const positionsData = this.points.geometry.attributes['position'].array;
  //
  //   let grouped: any = {};
  //   for (let i = 0; i < positionsData.length; i += 3) {
  //     let x = positionsData[i] * 10 - 5;
  //     let y = positionsData[i+1] * 10 - 5;
  //     let z = positionsData[i+2] * 10 - 5;
  //
  //     // Group by y-value, rounded to the nearest 0.1
  //     let key = Math.round(y * 10) / 10;
  //     if (!grouped[key]) {
  //       grouped[key] = [];
  //     }
  //     grouped[key].push(x, y, z);
  //   }
  //
  //   for (let key in grouped) {
  //     let points = grouped[key];
  //
  //     const geometry = new BufferGeometry();
  //     geometry.setAttribute('position', new BufferAttribute(new Float32Array(points), 3));
  //
  //     const material = new LineBasicMaterial({
  //       color: 0xffffff,
  //       blending: AdditiveBlending,
  //       depthTest: true,
  //       depthWrite: false,
  //       transparent: true,
  //       opacity: 0.1,
  //       side: DoubleSide,
  //     });
  //
  //     const line = new Line(geometry, material);
  //     this.scene.add(line);
  //   }
  // }


  addMesh() {

    const geometry = new BufferGeometry();
    let position = new Float32Array(this.WIDTH * this.WIDTH * 3);
    let reference = new Float32Array(this.WIDTH * this.WIDTH * 2);
    for (let i = 0; i < this.WIDTH * this.WIDTH; i++) {
      let x = Math.random();
      let y = Math.random();
      let z = Math.random();
      let xx = (i % this.WIDTH) / this.WIDTH;
      let yy = (i / this.WIDTH) / this.WIDTH;
      position.set([x, y, z], i * 3);
      reference.set([xx, yy], i * 2);
    }

    geometry.setAttribute('position', new BufferAttribute(position, 3));
    geometry.setAttribute('reference', new BufferAttribute(reference, 2));

    this.material = new ShaderMaterial({
      extensions: {
        derivatives: true
      },
      uniforms: {
        time: {value: 0},
        positions: {value: null},
        resolution: {value: new Vector4()},
        // particleSpeed: {value: 2}
      },
      // vertexColors: true,
      // blending: AdditiveBlending,
      // depthTest: true,
      // depthWrite: false,
      transparent: true,
      side: DoubleSide,
      vertexShader: vertex,
      fragmentShader: fragment
    });

    const mesh = new Points(geometry, this.material);
    this.points = mesh;
    this.scene.add(mesh);
  }

  initGpuCompute() {

    this.gpuCompute = new GPUComputationRenderer(this.WIDTH, this.WIDTH, this.renderer.renderer);

    this.faceTexture = this.createTexture(this.gpuCompute, this.faceGeometry);
    this.boxTexture = this.createTexture(this.gpuCompute, new BoxGeometry(10, 10, 10, 50, 50, 50));
    this.sphereTexture = this.createTexture(this.gpuCompute, new IcosahedronGeometry(7, 150));
    this.initTexture = this.faceTexture;

    // Add only one variable
    this.positionVariable = this.gpuCompute.addVariable('variable', fragmentSimulation, this.initTexture);

    // Add both textures as uniforms
    // this.positionVariable.material.uniforms['positionTexture1'] = {value: this.sphereTexture};
    // this.positionVariable.material.uniforms['positionTexture2'] = {value: this.boxTexture};

    // Other uniforms
    this.positionVariable.material.uniforms['time'] = {value: 0.0};
    this.positionVariable.material.uniforms['positions'] = {value: this.initTexture};
    this.positionVariable.material.uniforms['origins'] = {value: this.initTexture};

    this.positionVariable.material.uniforms['particleSpeed'] = {value: this.particleSpeed};
    this.positionVariable.material.uniforms['frequency'] = {value: this.frequency};
    this.positionVariable.material.uniforms['amplitude'] = {value: this.amplitude};
    this.positionVariable.material.uniforms['maxDistance'] = {value: this.maxDistance};
    // debugger

    this.gpuCompute.init();

  }

  createTexture(gpuCompute: GPUComputationRenderer, geometry: BufferGeometry) {
    let dtPosition = gpuCompute.createTexture();
    dtPosition.needsUpdate = true;
    this.fillPositionTexture(dtPosition, geometry);
    dtPosition.wrapS = RepeatWrapping;
    dtPosition.wrapT = RepeatWrapping;
    return dtPosition;
  }

  update(time: number) {

    if (!this.positionVariable) return;

    this.positionVariable.material.uniforms['time'].value = time;// this.normalizedTime;
    this.positionVariable.material.uniforms['frequency'].value = this.frequency;
    this.positionVariable.material.uniforms['amplitude'].value = this.amplitude;
    // this.positionVariable.material.uniforms['maxDistance'].value = this.maxDistance;

    this.gpuCompute.compute();
    this.material.uniforms['positions'].value = this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture;
    // console.log(this.positionVariable.initialValueTexture.image.data[123]);
    // console.log(this.positionVariable.material.uniforms['positions'].value.image.data);

    // this.addLines();
    this.updateLines();

    // Read back the texture data


    // Log the positions
    // for (let i = 0; i < data.length; i += 4) {
      // console.log('Position:', data[i], data[i + 1], data[i + 2]);
    // }

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

    // let arr = dtPosition.image.data;
    // let vertexData = geometry.getAttribute('position').array;
    //
    // for (let i = 0; i < arr.length; i += 8) { // Adjust loop step size
    //   let vertexIndex = i;//Math.floor(Math.random() * (vertexData.length / 3));
    //
    //   // Start point of line segment
    //   arr[i + 0] = vertexData[vertexIndex * 3];
    //   arr[i + 1] = vertexData[vertexIndex * 3 + 1];
    //   arr[i + 2] = vertexData[vertexIndex * 3 + 2];
    //   arr[i + 3] = 1;
    //
    //   // End point of line segment
    //   arr[i + 4] = vertexData[vertexIndex * 3];
    //   arr[i + 5] = vertexData[vertexIndex * 3 + 1]; // Add offset to y-coordinate to create a horizontal line
    //   arr[i + 6] = vertexData[vertexIndex * 3 + 2];
    //   arr[i + 7] = 1;
    // }

    dtPosition.needsUpdate = true;
  }

  // updateLines() {
  //
  //   let renderTarget = this.gpuCompute.getCurrentRenderTarget(this.positionVariable);
  //   let width = renderTarget.width;
  //   let height = renderTarget.height;
  //   let data = new Float32Array(width * height * 4);
  //   this.renderer.renderer.readRenderTargetPixels(renderTarget, 0, 0, width, height, data);
  //   // const positionsData = this.lines.geometry.attributes['position'].array;
  //   //
  //   // // Define the size of your world
  //   // let worldSize = new Vector3(10, 10, 10); // Replace with the size of your world
  //   //
  //   //
  //   // // Create an array to store our new positions
  //   // let position = new Float32Array(positionsData);  // note the * 2
  //
  //   // const vertexData = this.boxTexture.userData.vertexData;
  //   // console.log(vertexData[0]);
  //
  //   const positionsData = this.points.geometry.attributes['position'].array;//this.material.uniforms['positions'].value.image.data;
  //   // console.log(positionsData[0]);
  //
  //
  //
  //   // for (let i = 0; i < positionsData.length; i += 3) {
  //   //   position[i + 0] = vertexData[i * 3]; // Normalize to [0,1]
  //   //   position[i + 1] = vertexData[i * 3 + 1]; // Normalize to [0,1]
  //   //   position[i + 2] = vertexData[i * 3 + 2]; // Normalize to [0,1]
  //   // }
  //   //
  //   this.lines.geometry.setAttribute('position', new BufferAttribute(position, 3));
  //   this.lines.needsUpdate = true;
  // }
  updateLines() {
    // Get the current texture from the GPU computation
    let renderTarget = this.gpuCompute.getCurrentRenderTarget(this.positionVariable);

    // Read back the texture data
    let width = renderTarget.width;
    let height = renderTarget.height;
    let data = new Float32Array(width * height * 4);
    this.renderer.renderer.readRenderTargetPixels(renderTarget, 0, 0, width, height, data);

    // Create a new Float32Array to store the positions
    let positions = new Float32Array(data.length / 4 * 3);

    // Loop through the data and set the positions
    for (let i = 0; i < data.length; i += 4) {
      positions[i / 4 * 3] = data[i];      // x
      positions[i / 4 * 3 + 1] = data[i+1]; // y
      positions[i / 4 * 3 + 2] = data[i+2]; // z
    }

    // Set the new positions in the lines' geometry
    this.lines.geometry.setAttribute('position', new BufferAttribute(positions, 3));
    this.lines.geometry.attributes.position.needsUpdate = true; // Indicate that the positions need to be updated
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


}
