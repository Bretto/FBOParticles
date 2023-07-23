import { BoxGeometry, BufferAttribute, BufferGeometry, DoubleSide, IcosahedronGeometry, Line, LineBasicMaterial, Points, RepeatWrapping, ShaderMaterial, Vector4 } from 'three';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
// @ts-ignore
import vertex from './shaders/vertex-particles.glsl';
// @ts-ignore
import fragment from './shaders/fragment-particles.glsl';
// @ts-ignore
import fragmentSimulation from './shaders/fragment-simulation.glsl';
import gsap from 'gsap';
export class Sketch {
    constructor(renderer) {
        this.renderer = renderer;
        this.isRunning = true;
        this.WIDTH = 424;
        this.maxDistance = 1.99;
        this.frequency = .5;
        this.amplitude = 1.5;
        this.normalizedTime = 0; // A variable to store the normalized time (between 0 and 1)
        this.particleSpeed = 1.0;
        this.delta = 0.0;
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
    addLines() {
        const geometry = new BufferGeometry();
        // Get the positions array
        const positionsData = this.points.geometry.attributes['position'].array;
        // console.log(this.material.uniforms['positions'].value.image);
        // Define the size of your world
        // debugger
        // Create an array to store our new positions
        let position = new Float32Array(positionsData); // note the * 2
        // Create an array of vectors from the positions data
        for (let i = 0; i < position.length; i += 3) {
            let vertexIndex = Math.floor(Math.random() * (positionsData.length / 3));
            position[i]; // *= 10; // Normalize to [0,1]
            position[i + 1]; // *= 10; // Normalize to [0,1]
            position[i + 2]; // *= 10; // Normalize to [0,1]
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
                time: { value: 0 },
                positions: { value: null },
                resolution: { value: new Vector4() },
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
        this.positionVariable.material.uniforms['time'] = { value: 0.0 };
        this.positionVariable.material.uniforms['positions'] = { value: this.initTexture };
        this.positionVariable.material.uniforms['origins'] = { value: this.initTexture };
        this.positionVariable.material.uniforms['particleSpeed'] = { value: this.particleSpeed };
        this.positionVariable.material.uniforms['frequency'] = { value: this.frequency };
        this.positionVariable.material.uniforms['amplitude'] = { value: this.amplitude };
        this.positionVariable.material.uniforms['maxDistance'] = { value: this.maxDistance };
        // debugger
        this.gpuCompute.init();
    }
    createTexture(gpuCompute, geometry) {
        let dtPosition = gpuCompute.createTexture();
        dtPosition.needsUpdate = true;
        this.fillPositionTexture(dtPosition, geometry);
        dtPosition.wrapS = RepeatWrapping;
        dtPosition.wrapT = RepeatWrapping;
        return dtPosition;
    }
    update(time) {
        if (!this.positionVariable)
            return;
        this.positionVariable.material.uniforms['time'].value = time; // this.normalizedTime;
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
    fillPositionTexture(dtPosition, geometry) {
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
            positions[i / 4 * 3] = data[i]; // x
            positions[i / 4 * 3 + 1] = data[i + 1]; // y
            positions[i / 4 * 3 + 2] = data[i + 2]; // z
        }
        // Set the new positions in the lines' geometry
        this.lines.geometry.setAttribute('position', new BufferAttribute(positions, 3));
        this.lines.geometry.attributes.position.needsUpdate = true; // Indicate that the positions need to be updated
    }
    loadObj(url) {
        const loader = new OBJLoader();
        return new Promise((resolve, reject) => {
            return loader.load(url, (res) => {
                resolve(res);
            }, (xhr) => {
                // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            }, (error) => {
                console.log('An error happened');
                reject();
            });
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2tldGNoMi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNrZXRjaDIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUNMLFdBQVcsRUFDWCxlQUFlLEVBQ2YsY0FBYyxFQUVkLFVBQVUsRUFDVixtQkFBbUIsRUFDbkIsSUFBSSxFQUNKLGlCQUFpQixFQUNqQixNQUFNLEVBQ04sY0FBYyxFQUVkLGNBQWMsRUFDZCxPQUFPLEVBQ1IsTUFBTSxPQUFPLENBQUM7QUFDZixPQUFPLEVBQUMsc0JBQXNCLEVBQVcsTUFBTSxnREFBZ0QsQ0FBQztBQUNoRyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sc0NBQXNDLENBQUM7QUFFL0QsYUFBYTtBQUNiLE9BQU8sTUFBTSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3JELGFBQWE7QUFDYixPQUFPLFFBQVEsTUFBTSxtQ0FBbUMsQ0FBQztBQUN6RCxhQUFhO0FBQ2IsT0FBTyxrQkFBa0IsTUFBTSxvQ0FBb0MsQ0FBQztBQUdwRSxPQUFPLElBQUksTUFBTSxNQUFNLENBQUM7QUFHeEIsTUFBTSxPQUFPLE1BQU07SUEyQmpCLFlBQW9CLFFBQXlCO1FBQXpCLGFBQVEsR0FBUixRQUFRLENBQWlCO1FBeEI3QyxjQUFTLEdBQVksSUFBSSxDQUFDO1FBRTFCLFVBQUssR0FBRyxHQUFHLENBQUM7UUFLWixnQkFBVyxHQUFHLElBQUksQ0FBQztRQUNuQixjQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ2YsY0FBUyxHQUFHLEdBQUcsQ0FBQztRQU1oQixtQkFBYyxHQUFXLENBQUMsQ0FBQyxDQUFDLDREQUE0RDtRQUV4RixrQkFBYSxHQUFXLEdBQUcsQ0FBQztRQUM1QixVQUFLLEdBQVcsR0FBRyxDQUFDO1FBT2xCLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFdEIsMENBQTBDO1FBQzFDLGdDQUFnQztRQUVoQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDZixNQUFNLEdBQUcsR0FBRztZ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SUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxJQUFJLGVBQWUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoRixJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsQ0FBQyxpREFBaUQ7SUFDL0csQ0FBQztJQUlELE9BQU8sQ0FBQyxHQUFXO1FBQ2pCLE1BQU0sTUFBTSxHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7UUFDL0IsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNyQyxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQ2hCLEdBQUcsRUFDSCxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNOLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNmLENBQUMsRUFDRCxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNOLDREQUE0RDtZQUM5RCxDQUFDLEVBQ0QsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDUixPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQUM7Z0JBQ2pDLE1BQU0sRUFBRSxDQUFDO1lBQ1gsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FHRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UmVuZGVyZXJTZXJ2aWNlfSBmcm9tICcuL3JlbmRlcmVyLnNlcnZpY2UnO1xyXG5pbXBvcnQge1xyXG4gIEJveEdlb21ldHJ5LFxyXG4gIEJ1ZmZlckF0dHJpYnV0ZSxcclxuICBCdWZmZXJHZW9tZXRyeSxcclxuICBEYXRhVGV4dHVyZSxcclxuICBEb3VibGVTaWRlLFxyXG4gIEljb3NhaGVkcm9uR2VvbWV0cnksXHJcbiAgTGluZSxcclxuICBMaW5lQmFzaWNNYXRlcmlhbCxcclxuICBQb2ludHMsXHJcbiAgUmVwZWF0V3JhcHBpbmcsXHJcbiAgU2NlbmUsXHJcbiAgU2hhZGVyTWF0ZXJpYWwsXHJcbiAgVmVjdG9yNFxyXG59IGZyb20gJ3RocmVlJztcclxuaW1wb3J0IHtHUFVDb21wdXRhdGlvblJlbmRlcmVyLCBWYXJpYWJsZX0gZnJvbSAndGhyZWUvZXhhbXBsZXMvanNtL21pc2MvR1BVQ29tcHV0YXRpb25SZW5kZXJlcic7XHJcbmltcG9ydCB7T0JKTG9hZGVyfSBmcm9tICd0aHJlZS9leGFtcGxlcy9qc20vbG9hZGVycy9PQkpMb2FkZXInO1xyXG5cclxuLy8gQHRzLWlnbm9yZVxyXG5pbXBvcnQgdmVydGV4IGZyb20gJy4vc2hhZGVycy92ZXJ0ZXgtcGFydGljbGVzLmdsc2wnO1xyXG4vLyBAdHMtaWdub3JlXHJcbmltcG9ydCBmcmFnbWVudCBmcm9tICcuL3NoYWRlcnMvZnJhZ21lbnQtcGFydGljbGVzLmdsc2wnO1xyXG4vLyBAdHMtaWdub3JlXHJcbmltcG9ydCBmcmFnbWVudFNpbXVsYXRpb24gZnJvbSAnLi9zaGFkZXJzL2ZyYWdtZW50LXNpbXVsYXRpb24uZ2xzbCc7XHJcbi8vIEB0cy1pZ25vcmVcclxuaW1wb3J0IGZyYWdtZW50U2ltdWxhdGlvbjIgZnJvbSAnLi9zaGFkZXJzL2ZyYWdtZW50LXNpbXVsYXRpb24yLmdsc2wnO1xyXG5pbXBvcnQgZ3NhcCBmcm9tICdnc2FwJztcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgU2tldGNoIHtcclxuXHJcbiAgc2NlbmUhOiBTY2VuZTtcclxuICBpc1J1bm5pbmc6IGJvb2xlYW4gPSB0cnVlO1xyXG4gIGdwdUNvbXB1dGUhOiBHUFVDb21wdXRhdGlvblJlbmRlcmVyO1xyXG4gIFdJRFRIID0gNDI0O1xyXG4gIGR0UG9zaXRpb24xITogRGF0YVRleHR1cmU7XHJcbiAgZHRQb3NpdGlvbjIhOiBEYXRhVGV4dHVyZTtcclxuICBwb3NpdGlvblZhcmlhYmxlITogVmFyaWFibGU7XHJcbiAgbWF0ZXJpYWwhOiBhbnk7XHJcbiAgbWF4RGlzdGFuY2UgPSAxLjk5O1xyXG4gIGZyZXF1ZW5jeSA9IC41O1xyXG4gIGFtcGxpdHVkZSA9IDEuNTtcclxuXHJcbiAgZmFjZVRleHR1cmUhOiBEYXRhVGV4dHVyZTtcclxuICBzcGhlcmVUZXh0dXJlITogRGF0YVRleHR1cmU7XHJcbiAgYm94VGV4dHVyZSE6IERhdGFUZXh0dXJlO1xyXG5cclxuICBub3JtYWxpemVkVGltZTogbnVtYmVyID0gMDsgLy8gQSB2YXJpYWJsZSB0byBzdG9yZSB0aGUgbm9ybWFsaXplZCB0aW1lIChiZXR3ZWVuIDAgYW5kIDEpXHJcbiAgZmFjZUdlb21ldHJ5ITogQnVmZmVyR2VvbWV0cnk7XHJcbiAgcGFydGljbGVTcGVlZDogbnVtYmVyID0gMS4wO1xyXG4gIGRlbHRhOiBudW1iZXIgPSAwLjA7XHJcblxyXG4gIHBvaW50cyE6IFBvaW50cztcclxuICBsaW5lcyE6IGFueTtcclxuICBpbml0VGV4dHVyZSE6IERhdGFUZXh0dXJlO1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlbmRlcmVyOiBSZW5kZXJlclNlcnZpY2UpIHtcclxuICAgIGNvbnNvbGUubG9nKCdTa2V0Y2gnKTtcclxuXHJcbiAgICAvLyBjb25zdCBheGVzSGVscGVyID0gbmV3IEF4ZXNIZWxwZXIoIDUgKTtcclxuICAgIC8vIHRoaXMuc2NlbmUuYWRkKCBheGVzSGVscGVyICk7XHJcblxyXG4gICAgdGhpcy5wcmVsb2FkKCk7XHJcbiAgICBjb25zdCBvYmogPSB7XHJcbiAgICAgIGFtcGxpdHVkZTogMS41LFxyXG4gICAgICBmcmVxdWVuY3k6IDAuNSxcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgdCA9IGdzYXAudG8ob2JqLCB7XHJcbiAgICAgIGFtcGxpdHVkZTogMS44LFxyXG4gICAgICBmcmVxdWVuY3k6IC4yNSwgZHVyYXRpb246IDcsXHJcbiAgICAgIGVhc2U6ICdwb3dlcjMuaW5PdXQnLCByZXBlYXQ6IC0xLCB5b3lvOiB0cnVlLFxyXG4gICAgICBvblJlcGVhdDogKCkgPT4ge1xyXG4gICAgICAgIC8vIGlmICghdGhpcy5wb3NpdGlvblZhcmlhYmxlKSByZXR1cm47XHJcbiAgICAgICAgLy8gLy8gdGhpcy5maWxsUG9zaXRpb25UZXh0dXJlKHRoaXMuZHRQb3NpdGlvbjEsIG5ldyBJY29zYWhlZHJvbkdlb21ldHJ5KDcsIDUwKSk7XHJcbiAgICAgICAgLy8gY29uc3Qgc2l6ZSA9IE1hdGgucmFuZG9tKCkgKiA3ICsgMztcclxuICAgICAgICAvLyBjb25zdCBzZWdtZW50cyA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDUwKSArIDEwO1xyXG4gICAgICAgIC8vIHRoaXMuYm94VGV4dHVyZSA9IHRoaXMuY3JlYXRlVGV4dHVyZSh0aGlzLmdwdUNvbXB1dGUsIG5ldyBCb3hHZW9tZXRyeShzaXplLCBzaXplLCBzaXplLCBzZWdtZW50cywgc2VnbWVudHMsIHNlZ21lbnRzKSk7XHJcbiAgICAgICAgLy8gdGhpcy5zcGhlcmVUZXh0dXJlID0gdGhpcy5jcmVhdGVUZXh0dXJlKHRoaXMuZ3B1Q29tcHV0ZSwgbmV3IEljb3NhaGVkcm9uR2VvbWV0cnkoc2l6ZSwgc2VnbWVudHMpKTtcclxuICAgICAgICAvLyBjb25zdCB0ZXh0dXJlcyA9IFt0aGlzLmZhY2VUZXh0dXJlLCB0aGlzLmJveFRleHR1cmUsIHRoaXMuc3BoZXJlVGV4dHVyZSwgdGhpcy5ib3hUZXh0dXJlLCB0aGlzLmZhY2VUZXh0dXJlXTtcclxuICAgICAgICAvLyBjb25zdCB0ZXh0dXJlID0gdGV4dHVyZXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGV4dHVyZXMubGVuZ3RoKV07XHJcbiAgICAgICAgLy8gdGhpcy5wb3NpdGlvblZhcmlhYmxlLm1hdGVyaWFsLnVuaWZvcm1zWydwb3NpdGlvblRleHR1cmUyJ10gPSB7dmFsdWU6IHRleHR1cmV9O1xyXG4gICAgICAgIC8vIC8vIHRoaXMuZ3B1Q29tcHV0ZS5pbml0KCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIG9uVXBkYXRlOiAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5hbXBsaXR1ZGUgPSBvYmouYW1wbGl0dWRlO1xyXG4gICAgICAgIHRoaXMuZnJlcXVlbmN5ID0gb2JqLmZyZXF1ZW5jeTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gY29uc3QgdCA9IGdzYXAudG8odGhpcywge1xyXG4gICAgLy8gICBub3JtYWxpemVkVGltZTogMSwgZHVyYXRpb246IDQsXHJcbiAgICAvLyAgIGVhc2U6ICdwb3dlcjMuaW5PdXQnLCByZXBlYXQ6IC0xLCB5b3lvOiB0cnVlLFxyXG4gICAgLy8gICBvblJlcGVhdDogKCkgPT4ge1xyXG4gICAgLy8gICAgIC8vIGlmICghdGhpcy5wb3NpdGlvblZhcmlhYmxlKSByZXR1cm47XHJcbiAgICAvLyAgICAgLy8gLy8gdGhpcy5maWxsUG9zaXRpb25UZXh0dXJlKHRoaXMuZHRQb3NpdGlvbjEsIG5ldyBJY29zYWhlZHJvbkdlb21ldHJ5KDcsIDUwKSk7XHJcbiAgICAvLyAgICAgLy8gY29uc3Qgc2l6ZSA9IE1hdGgucmFuZG9tKCkgKiA3ICsgMztcclxuICAgIC8vICAgICAvLyBjb25zdCBzZWdtZW50cyA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDUwKSArIDEwO1xyXG4gICAgLy8gICAgIC8vIHRoaXMuYm94VGV4dHVyZSA9IHRoaXMuY3JlYXRlVGV4dHVyZSh0aGlzLmdwdUNvbXB1dGUsIG5ldyBCb3hHZW9tZXRyeShzaXplLCBzaXplLCBzaXplLCBzZWdtZW50cywgc2VnbWVudHMsIHNlZ21lbnRzKSk7XHJcbiAgICAvLyAgICAgLy8gdGhpcy5zcGhlcmVUZXh0dXJlID0gdGhpcy5jcmVhdGVUZXh0dXJlKHRoaXMuZ3B1Q29tcHV0ZSwgbmV3IEljb3NhaGVkcm9uR2VvbWV0cnkoc2l6ZSwgc2VnbWVudHMpKTtcclxuICAgIC8vICAgICAvLyBjb25zdCB0ZXh0dXJlcyA9IFt0aGlzLmZhY2VUZXh0dXJlLCB0aGlzLmJveFRleHR1cmUsIHRoaXMuc3BoZXJlVGV4dHVyZSwgdGhpcy5ib3hUZXh0dXJlLCB0aGlzLmZhY2VUZXh0dXJlXTtcclxuICAgIC8vICAgICAvLyBjb25zdCB0ZXh0dXJlID0gdGV4dHVyZXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGV4dHVyZXMubGVuZ3RoKV07XHJcbiAgICAvLyAgICAgLy8gdGhpcy5wb3NpdGlvblZhcmlhYmxlLm1hdGVyaWFsLnVuaWZvcm1zWydwb3NpdGlvblRleHR1cmUyJ10gPSB7dmFsdWU6IHRleHR1cmV9O1xyXG4gICAgLy8gICAgIC8vIC8vIHRoaXMuZ3B1Q29tcHV0ZS5pbml0KCk7XHJcbiAgICAvLyAgIH1cclxuICAgIC8vIH0pO1xyXG5cclxuICAgIC8vIHRoaXMuYWRkRmFjZSgpO1xyXG4gICAgLy8gdGhpcy5hZGRTcGhlcmUoKTtcclxuICB9XHJcblxyXG4gIGluaXQoKSB7XHJcbiAgICB0aGlzLnNjZW5lID0gdGhpcy5yZW5kZXJlci5zY2VuZTtcclxuICAgIHRoaXMuaW5pdEdwdUNvbXB1dGUoKTtcclxuICAgIC8vIHRoaXMucG9zaXRpb25WYXJpYWJsZS5tYXRlcmlhbC51bmlmb3Jtc1snb3JpZ2lucyddLnZhbHVlID0gdGhpcy5ncHVDb21wdXRlLmdldEN1cnJlbnRSZW5kZXJUYXJnZXQodGhpcy5wb3NpdGlvblZhcmlhYmxlKS50ZXh0dXJlO1xyXG4gICAgdGhpcy5hZGRNZXNoKCk7XHJcbiAgICB0aGlzLmFkZExpbmVzKCk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBwcmVsb2FkKCkge1xyXG4gICAgY29uc3QgZmFjZSA9IGF3YWl0IHRoaXMubG9hZE9iaignYXNzZXRzL2ZhY2Uub2JqJyk7XHJcbiAgICB0aGlzLmZhY2VHZW9tZXRyeSA9IGZhY2UuY2hpbGRyZW5bMF0uZ2VvbWV0cnk7XHJcbiAgICB0aGlzLmluaXQoKTtcclxuICB9XHJcblxyXG4gIGFkZExpbmVzKCk6IHZvaWQge1xyXG4gICAgY29uc3QgZ2VvbWV0cnkgPSBuZXcgQnVmZmVyR2VvbWV0cnkoKTtcclxuXHJcbiAgICAvLyBHZXQgdGhlIHBvc2l0aW9ucyBhcnJheVxyXG4gICAgY29uc3QgcG9zaXRpb25zRGF0YSA9IHRoaXMucG9pbnRzLmdlb21ldHJ5LmF0dHJpYnV0ZXNbJ3Bvc2l0aW9uJ10uYXJyYXk7XHJcbiAgICAvLyBjb25zb2xlLmxvZyh0aGlzLm1hdGVyaWFsLnVuaWZvcm1zWydwb3NpdGlvbnMnXS52YWx1ZS5pbWFnZSk7XHJcbiAgICAvLyBEZWZpbmUgdGhlIHNpemUgb2YgeW91ciB3b3JsZFxyXG4gICAgLy8gZGVidWdnZXJcclxuXHJcbiAgICAvLyBDcmVhdGUgYW4gYXJyYXkgdG8gc3RvcmUgb3VyIG5ldyBwb3NpdGlvbnNcclxuICAgIGxldCBwb3NpdGlvbiA9IG5ldyBGbG9hdDMyQXJyYXkocG9zaXRpb25zRGF0YSk7ICAvLyBub3RlIHRoZSAqIDJcclxuXHJcbiAgICAvLyBDcmVhdGUgYW4gYXJyYXkgb2YgdmVjdG9ycyBmcm9tIHRoZSBwb3NpdGlvbnMgZGF0YVxyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcG9zaXRpb24ubGVuZ3RoOyBpICs9IDMpIHtcclxuICAgICAgbGV0IHZlcnRleEluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKHBvc2l0aW9uc0RhdGEubGVuZ3RoIC8gMykpO1xyXG4gICAgICBwb3NpdGlvbltpXTsvLyAqPSAxMDsgLy8gTm9ybWFsaXplIHRvIFswLDFdXHJcbiAgICAgIHBvc2l0aW9uW2kgKyAxXTsvLyAqPSAxMDsgLy8gTm9ybWFsaXplIHRvIFswLDFdXHJcbiAgICAgIHBvc2l0aW9uW2kgKyAyXTsvLyAqPSAxMDsgLy8gTm9ybWFsaXplIHRvIFswLDFdXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLy8gU29ydCB2ZWN0b3JzIGJ5IHktY29vcmRpbmF0ZVxyXG4gICAgLy8gcG9zaXRpb24uc29ydCgoYSwgYikgPT4gYS55IC0gYi55KTtcclxuICAgIC8vXHJcbiAgICAvLyAvLyBMb29wIHRocm91Z2ggdGhlIHNvcnRlZCB2ZWN0b3JzIGFuZCBzZXQgdGhlIG5ldyBwb3NpdGlvbnNcclxuICAgIC8vIGZvciAobGV0IGkgPSAwOyBpIDwgdmVjdG9ycy5sZW5ndGg7IGkrKykge1xyXG4gICAgLy8gICBwb3NpdGlvbi5zZXQoW3ZlY3RvcnNbaV0ueCwgdmVjdG9yc1tpXS55LCB2ZWN0b3JzW2ldLnpdLCBpICogMyk7XHJcbiAgICAvLyB9XHJcblxyXG4gICAgZ2VvbWV0cnkuc2V0QXR0cmlidXRlKCdwb3NpdGlvbicsIG5ldyBCdWZmZXJBdHRyaWJ1dGUocG9zaXRpb24sIDMpKTtcclxuXHJcbiAgICBjb25zdCBtYXRlcmlhbCA9IG5ldyBMaW5lQmFzaWNNYXRlcmlhbCh7XHJcbiAgICAgIGNvbG9yOiAnIzAwNjY2NicsXHJcbiAgICAgIC8vIGJsZW5kaW5nOiBBZGRpdGl2ZUJsZW5kaW5nLFxyXG4gICAgICBkZXB0aFRlc3Q6IHRydWUsXHJcbiAgICAgIGRlcHRoV3JpdGU6IGZhbHNlLFxyXG4gICAgICB0cmFuc3BhcmVudDogdHJ1ZSxcclxuICAgICAgb3BhY2l0eTogMC4wMDY1LFxyXG4gICAgICBzaWRlOiBEb3VibGVTaWRlLFxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgbWVzaCA9IG5ldyBMaW5lKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgICAvLyBtZXNoLnRyYW5zbGF0ZVkoLTUpO1xyXG4gICAgLy8gbWVzaC50cmFuc2xhdGVYKC01KTtcclxuICAgIC8vIG1lc2gudHJhbnNsYXRlWigtNSk7XHJcblxyXG4gICAgLy8gbWVzaC52Lm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIHRoaXMubGluZXMgPSBtZXNoO1xyXG4gICAgdGhpcy5zY2VuZS5hZGQobWVzaCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gYWRkTGluZXMoKTogdm9pZCB7XHJcbiAgLy8gICBjb25zdCBwb3NpdGlvbnNEYXRhID0gdGhpcy5wb2ludHMuZ2VvbWV0cnkuYXR0cmlidXRlc1sncG9zaXRpb24nXS5hcnJheTtcclxuICAvL1xyXG4gIC8vICAgbGV0IGdyb3VwZWQ6IGFueSA9IHt9O1xyXG4gIC8vICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb3NpdGlvbnNEYXRhLmxlbmd0aDsgaSArPSAzKSB7XHJcbiAgLy8gICAgIGxldCB4ID0gcG9zaXRpb25zRGF0YVtpXSAqIDEwIC0gNTtcclxuICAvLyAgICAgbGV0IHkgPSBwb3NpdGlvbnNEYXRhW2krMV0gKiAxMCAtIDU7XHJcbiAgLy8gICAgIGxldCB6ID0gcG9zaXRpb25zRGF0YVtpKzJdICogMTAgLSA1O1xyXG4gIC8vXHJcbiAgLy8gICAgIC8vIEdyb3VwIGJ5IHktdmFsdWUsIHJvdW5kZWQgdG8gdGhlIG5lYXJlc3QgMC4xXHJcbiAgLy8gICAgIGxldCBrZXkgPSBNYXRoLnJvdW5kKHkgKiAxMCkgLyAxMDtcclxuICAvLyAgICAgaWYgKCFncm91cGVkW2tleV0pIHtcclxuICAvLyAgICAgICBncm91cGVkW2tleV0gPSBbXTtcclxuICAvLyAgICAgfVxyXG4gIC8vICAgICBncm91cGVkW2tleV0ucHVzaCh4LCB5LCB6KTtcclxuICAvLyAgIH1cclxuICAvL1xyXG4gIC8vICAgZm9yIChsZXQga2V5IGluIGdyb3VwZWQpIHtcclxuICAvLyAgICAgbGV0IHBvaW50cyA9IGdyb3VwZWRba2V5XTtcclxuICAvL1xyXG4gIC8vICAgICBjb25zdCBnZW9tZXRyeSA9IG5ldyBCdWZmZXJHZW9tZXRyeSgpO1xyXG4gIC8vICAgICBnZW9tZXRyeS5zZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJywgbmV3IEJ1ZmZlckF0dHJpYnV0ZShuZXcgRmxvYXQzMkFycmF5KHBvaW50cyksIDMpKTtcclxuICAvL1xyXG4gIC8vICAgICBjb25zdCBtYXRlcmlhbCA9IG5ldyBMaW5lQmFzaWNNYXRlcmlhbCh7XHJcbiAgLy8gICAgICAgY29sb3I6IDB4ZmZmZmZmLFxyXG4gIC8vICAgICAgIGJsZW5kaW5nOiBBZGRpdGl2ZUJsZW5kaW5nLFxyXG4gIC8vICAgICAgIGRlcHRoVGVzdDogdHJ1ZSxcclxuICAvLyAgICAgICBkZXB0aFdyaXRlOiBmYWxzZSxcclxuICAvLyAgICAgICB0cmFuc3BhcmVudDogdHJ1ZSxcclxuICAvLyAgICAgICBvcGFjaXR5OiAwLjEsXHJcbiAgLy8gICAgICAgc2lkZTogRG91YmxlU2lkZSxcclxuICAvLyAgICAgfSk7XHJcbiAgLy9cclxuICAvLyAgICAgY29uc3QgbGluZSA9IG5ldyBMaW5lKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgLy8gICAgIHRoaXMuc2NlbmUuYWRkKGxpbmUpO1xyXG4gIC8vICAgfVxyXG4gIC8vIH1cclxuXHJcblxyXG4gIGFkZE1lc2goKSB7XHJcblxyXG4gICAgY29uc3QgZ2VvbWV0cnkgPSBuZXcgQnVmZmVyR2VvbWV0cnkoKTtcclxuICAgIGxldCBwb3NpdGlvbiA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5XSURUSCAqIHRoaXMuV0lEVEggKiAzKTtcclxuICAgIGxldCByZWZlcmVuY2UgPSBuZXcgRmxvYXQzMkFycmF5KHRoaXMuV0lEVEggKiB0aGlzLldJRFRIICogMik7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuV0lEVEggKiB0aGlzLldJRFRIOyBpKyspIHtcclxuICAgICAgbGV0IHggPSBNYXRoLnJhbmRvbSgpO1xyXG4gICAgICBsZXQgeSA9IE1hdGgucmFuZG9tKCk7XHJcbiAgICAgIGxldCB6ID0gTWF0aC5yYW5kb20oKTtcclxuICAgICAgbGV0IHh4ID0gKGkgJSB0aGlzLldJRFRIKSAvIHRoaXMuV0lEVEg7XHJcbiAgICAgIGxldCB5eSA9IChpIC8gdGhpcy5XSURUSCkgLyB0aGlzLldJRFRIO1xyXG4gICAgICBwb3NpdGlvbi5zZXQoW3gsIHksIHpdLCBpICogMyk7XHJcbiAgICAgIHJlZmVyZW5jZS5zZXQoW3h4LCB5eV0sIGkgKiAyKTtcclxuICAgIH1cclxuXHJcbiAgICBnZW9tZXRyeS5zZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJywgbmV3IEJ1ZmZlckF0dHJpYnV0ZShwb3NpdGlvbiwgMykpO1xyXG4gICAgZ2VvbWV0cnkuc2V0QXR0cmlidXRlKCdyZWZlcmVuY2UnLCBuZXcgQnVmZmVyQXR0cmlidXRlKHJlZmVyZW5jZSwgMikpO1xyXG5cclxuICAgIHRoaXMubWF0ZXJpYWwgPSBuZXcgU2hhZGVyTWF0ZXJpYWwoe1xyXG4gICAgICBleHRlbnNpb25zOiB7XHJcbiAgICAgICAgZGVyaXZhdGl2ZXM6IHRydWVcclxuICAgICAgfSxcclxuICAgICAgdW5pZm9ybXM6IHtcclxuICAgICAgICB0aW1lOiB7dmFsdWU6IDB9LFxyXG4gICAgICAgIHBvc2l0aW9uczoge3ZhbHVlOiBudWxsfSxcclxuICAgICAgICByZXNvbHV0aW9uOiB7dmFsdWU6IG5ldyBWZWN0b3I0KCl9LFxyXG4gICAgICAgIC8vIHBhcnRpY2xlU3BlZWQ6IHt2YWx1ZTogMn1cclxuICAgICAgfSxcclxuICAgICAgLy8gdmVydGV4Q29sb3JzOiB0cnVlLFxyXG4gICAgICAvLyBibGVuZGluZzogQWRkaXRpdmVCbGVuZGluZyxcclxuICAgICAgLy8gZGVwdGhUZXN0OiB0cnVlLFxyXG4gICAgICAvLyBkZXB0aFdyaXRlOiBmYWxzZSxcclxuICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsXHJcbiAgICAgIHNpZGU6IERvdWJsZVNpZGUsXHJcbiAgICAgIHZlcnRleFNoYWRlcjogdmVydGV4LFxyXG4gICAgICBmcmFnbWVudFNoYWRlcjogZnJhZ21lbnRcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IG1lc2ggPSBuZXcgUG9pbnRzKGdlb21ldHJ5LCB0aGlzLm1hdGVyaWFsKTtcclxuICAgIHRoaXMucG9pbnRzID0gbWVzaDtcclxuICAgIHRoaXMuc2NlbmUuYWRkKG1lc2gpO1xyXG4gIH1cclxuXHJcbiAgaW5pdEdwdUNvbXB1dGUoKSB7XHJcblxyXG4gICAgdGhpcy5ncHVDb21wdXRlID0gbmV3IEdQVUNvbXB1dGF0aW9uUmVuZGVyZXIodGhpcy5XSURUSCwgdGhpcy5XSURUSCwgdGhpcy5yZW5kZXJlci5yZW5kZXJlcik7XHJcblxyXG4gICAgdGhpcy5mYWNlVGV4dHVyZSA9IHRoaXMuY3JlYXRlVGV4dHVyZSh0aGlzLmdwdUNvbXB1dGUsIHRoaXMuZmFjZUdlb21ldHJ5KTtcclxuICAgIHRoaXMuYm94VGV4dHVyZSA9IHRoaXMuY3JlYXRlVGV4dHVyZSh0aGlzLmdwdUNvbXB1dGUsIG5ldyBCb3hHZW9tZXRyeSgxMCwgMTAsIDEwLCA1MCwgNTAsIDUwKSk7XHJcbiAgICB0aGlzLnNwaGVyZVRleHR1cmUgPSB0aGlzLmNyZWF0ZVRleHR1cmUodGhpcy5ncHVDb21wdXRlLCBuZXcgSWNvc2FoZWRyb25HZW9tZXRyeSg3LCAxNTApKTtcclxuICAgIHRoaXMuaW5pdFRleHR1cmUgPSB0aGlzLmZhY2VUZXh0dXJlO1xyXG5cclxuICAgIC8vIEFkZCBvbmx5IG9uZSB2YXJpYWJsZVxyXG4gICAgdGhpcy5wb3NpdGlvblZhcmlhYmxlID0gdGhpcy5ncHVDb21wdXRlLmFkZFZhcmlhYmxlKCd2YXJpYWJsZScsIGZyYWdtZW50U2ltdWxhdGlvbiwgdGhpcy5pbml0VGV4dHVyZSk7XHJcblxyXG4gICAgLy8gQWRkIGJvdGggdGV4dHVyZXMgYXMgdW5pZm9ybXNcclxuICAgIC8vIHRoaXMucG9zaXRpb25WYXJpYWJsZS5tYXRlcmlhbC51bmlmb3Jtc1sncG9zaXRpb25UZXh0dXJlMSddID0ge3ZhbHVlOiB0aGlzLnNwaGVyZVRleHR1cmV9O1xyXG4gICAgLy8gdGhpcy5wb3NpdGlvblZhcmlhYmxlLm1hdGVyaWFsLnVuaWZvcm1zWydwb3NpdGlvblRleHR1cmUyJ10gPSB7dmFsdWU6IHRoaXMuYm94VGV4dHVyZX07XHJcblxyXG4gICAgLy8gT3RoZXIgdW5pZm9ybXNcclxuICAgIHRoaXMucG9zaXRpb25WYXJpYWJsZS5tYXRlcmlhbC51bmlmb3Jtc1sndGltZSddID0ge3ZhbHVlOiAwLjB9O1xyXG4gICAgdGhpcy5wb3NpdGlvblZhcmlhYmxlLm1hdGVyaWFsLnVuaWZvcm1zWydwb3NpdGlvbnMnXSA9IHt2YWx1ZTogdGhpcy5pbml0VGV4dHVyZX07XHJcbiAgICB0aGlzLnBvc2l0aW9uVmFyaWFibGUubWF0ZXJpYWwudW5pZm9ybXNbJ29yaWdpbnMnXSA9IHt2YWx1ZTogdGhpcy5pbml0VGV4dHVyZX07XHJcblxyXG4gICAgdGhpcy5wb3NpdGlvblZhcmlhYmxlLm1hdGVyaWFsLnVuaWZvcm1zWydwYXJ0aWNsZVNwZWVkJ10gPSB7dmFsdWU6IHRoaXMucGFydGljbGVTcGVlZH07XHJcbiAgICB0aGlzLnBvc2l0aW9uVmFyaWFibGUubWF0ZXJpYWwudW5pZm9ybXNbJ2ZyZXF1ZW5jeSddID0ge3ZhbHVlOiB0aGlzLmZyZXF1ZW5jeX07XHJcbiAgICB0aGlzLnBvc2l0aW9uVmFyaWFibGUubWF0ZXJpYWwudW5pZm9ybXNbJ2FtcGxpdHVkZSddID0ge3ZhbHVlOiB0aGlzLmFtcGxpdHVkZX07XHJcbiAgICB0aGlzLnBvc2l0aW9uVmFyaWFibGUubWF0ZXJpYWwudW5pZm9ybXNbJ21heERpc3RhbmNlJ10gPSB7dmFsdWU6IHRoaXMubWF4RGlzdGFuY2V9O1xyXG4gICAgLy8gZGVidWdnZXJcclxuXHJcbiAgICB0aGlzLmdwdUNvbXB1dGUuaW5pdCgpO1xyXG5cclxuICB9XHJcblxyXG4gIGNyZWF0ZVRleHR1cmUoZ3B1Q29tcHV0ZTogR1BVQ29tcHV0YXRpb25SZW5kZXJlciwgZ2VvbWV0cnk6IEJ1ZmZlckdlb21ldHJ5KSB7XHJcbiAgICBsZXQgZHRQb3NpdGlvbiA9IGdwdUNvbXB1dGUuY3JlYXRlVGV4dHVyZSgpO1xyXG4gICAgZHRQb3NpdGlvbi5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICB0aGlzLmZpbGxQb3NpdGlvblRleHR1cmUoZHRQb3NpdGlvbiwgZ2VvbWV0cnkpO1xyXG4gICAgZHRQb3NpdGlvbi53cmFwUyA9IFJlcGVhdFdyYXBwaW5nO1xyXG4gICAgZHRQb3NpdGlvbi53cmFwVCA9IFJlcGVhdFdyYXBwaW5nO1xyXG4gICAgcmV0dXJuIGR0UG9zaXRpb247XHJcbiAgfVxyXG5cclxuICB1cGRhdGUodGltZTogbnVtYmVyKSB7XHJcblxyXG4gICAgaWYgKCF0aGlzLnBvc2l0aW9uVmFyaWFibGUpIHJldHVybjtcclxuXHJcbiAgICB0aGlzLnBvc2l0aW9uVmFyaWFibGUubWF0ZXJpYWwudW5pZm9ybXNbJ3RpbWUnXS52YWx1ZSA9IHRpbWU7Ly8gdGhpcy5ub3JtYWxpemVkVGltZTtcclxuICAgIHRoaXMucG9zaXRpb25WYXJpYWJsZS5tYXRlcmlhbC51bmlmb3Jtc1snZnJlcXVlbmN5J10udmFsdWUgPSB0aGlzLmZyZXF1ZW5jeTtcclxuICAgIHRoaXMucG9zaXRpb25WYXJpYWJsZS5tYXRlcmlhbC51bmlmb3Jtc1snYW1wbGl0dWRlJ10udmFsdWUgPSB0aGlzLmFtcGxpdHVkZTtcclxuICAgIC8vIHRoaXMucG9zaXRpb25WYXJpYWJsZS5tYXRlcmlhbC51bmlmb3Jtc1snbWF4RGlzdGFuY2UnXS52YWx1ZSA9IHRoaXMubWF4RGlzdGFuY2U7XHJcblxyXG4gICAgdGhpcy5ncHVDb21wdXRlLmNvbXB1dGUoKTtcclxuICAgIHRoaXMubWF0ZXJpYWwudW5pZm9ybXNbJ3Bvc2l0aW9ucyddLnZhbHVlID0gdGhpcy5ncHVDb21wdXRlLmdldEN1cnJlbnRSZW5kZXJUYXJnZXQodGhpcy5wb3NpdGlvblZhcmlhYmxlKS50ZXh0dXJlO1xyXG4gICAgLy8gY29uc29sZS5sb2codGhpcy5wb3NpdGlvblZhcmlhYmxlLmluaXRpYWxWYWx1ZVRleHR1cmUuaW1hZ2UuZGF0YVsxMjNdKTtcclxuICAgIC8vIGNvbnNvbGUubG9nKHRoaXMucG9zaXRpb25WYXJpYWJsZS5tYXRlcmlhbC51bmlmb3Jtc1sncG9zaXRpb25zJ10udmFsdWUuaW1hZ2UuZGF0YSk7XHJcblxyXG4gICAgLy8gdGhpcy5hZGRMaW5lcygpO1xyXG4gICAgdGhpcy51cGRhdGVMaW5lcygpO1xyXG5cclxuICAgIC8vIFJlYWQgYmFjayB0aGUgdGV4dHVyZSBkYXRhXHJcblxyXG5cclxuICAgIC8vIExvZyB0aGUgcG9zaXRpb25zXHJcbiAgICAvLyBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpICs9IDQpIHtcclxuICAgICAgLy8gY29uc29sZS5sb2coJ1Bvc2l0aW9uOicsIGRhdGFbaV0sIGRhdGFbaSArIDFdLCBkYXRhW2kgKyAyXSk7XHJcbiAgICAvLyB9XHJcblxyXG4gIH1cclxuXHJcbiAgZmlsbFBvc2l0aW9uVGV4dHVyZShkdFBvc2l0aW9uOiBEYXRhVGV4dHVyZSwgZ2VvbWV0cnk6IGFueSkge1xyXG5cclxuICAgIGxldCBhcnIgPSBkdFBvc2l0aW9uLmltYWdlLmRhdGE7XHJcbiAgICBsZXQgdmVydGV4RGF0YSA9IGdlb21ldHJ5LmdldEF0dHJpYnV0ZSgncG9zaXRpb24nKS5hcnJheTtcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkgKz0gNCkge1xyXG4gICAgICBsZXQgdmVydGV4SW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAodmVydGV4RGF0YS5sZW5ndGggLyAzKSk7XHJcbiAgICAgIGFycltpICsgMF0gPSB2ZXJ0ZXhEYXRhW3ZlcnRleEluZGV4ICogM107IC8vIE5vcm1hbGl6ZSB0byBbMCwxXVxyXG4gICAgICBhcnJbaSArIDFdID0gdmVydGV4RGF0YVt2ZXJ0ZXhJbmRleCAqIDMgKyAxXTsgLy8gTm9ybWFsaXplIHRvIFswLDFdXHJcbiAgICAgIGFycltpICsgMl0gPSB2ZXJ0ZXhEYXRhW3ZlcnRleEluZGV4ICogMyArIDJdOyAvLyBOb3JtYWxpemUgdG8gWzAsMV1cclxuICAgICAgYXJyW2kgKyAzXSA9IDE7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbGV0IGFyciA9IGR0UG9zaXRpb24uaW1hZ2UuZGF0YTtcclxuICAgIC8vIGxldCB2ZXJ0ZXhEYXRhID0gZ2VvbWV0cnkuZ2V0QXR0cmlidXRlKCdwb3NpdGlvbicpLmFycmF5O1xyXG4gICAgLy9cclxuICAgIC8vIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSArPSA4KSB7IC8vIEFkanVzdCBsb29wIHN0ZXAgc2l6ZVxyXG4gICAgLy8gICBsZXQgdmVydGV4SW5kZXggPSBpOy8vTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKHZlcnRleERhdGEubGVuZ3RoIC8gMykpO1xyXG4gICAgLy9cclxuICAgIC8vICAgLy8gU3RhcnQgcG9pbnQgb2YgbGluZSBzZWdtZW50XHJcbiAgICAvLyAgIGFycltpICsgMF0gPSB2ZXJ0ZXhEYXRhW3ZlcnRleEluZGV4ICogM107XHJcbiAgICAvLyAgIGFycltpICsgMV0gPSB2ZXJ0ZXhEYXRhW3ZlcnRleEluZGV4ICogMyArIDFdO1xyXG4gICAgLy8gICBhcnJbaSArIDJdID0gdmVydGV4RGF0YVt2ZXJ0ZXhJbmRleCAqIDMgKyAyXTtcclxuICAgIC8vICAgYXJyW2kgKyAzXSA9IDE7XHJcbiAgICAvL1xyXG4gICAgLy8gICAvLyBFbmQgcG9pbnQgb2YgbGluZSBzZWdtZW50XHJcbiAgICAvLyAgIGFycltpICsgNF0gPSB2ZXJ0ZXhEYXRhW3ZlcnRleEluZGV4ICogM107XHJcbiAgICAvLyAgIGFycltpICsgNV0gPSB2ZXJ0ZXhEYXRhW3ZlcnRleEluZGV4ICogMyArIDFdOyAvLyBBZGQgb2Zmc2V0IHRvIHktY29vcmRpbmF0ZSB0byBjcmVhdGUgYSBob3Jpem9udGFsIGxpbmVcclxuICAgIC8vICAgYXJyW2kgKyA2XSA9IHZlcnRleERhdGFbdmVydGV4SW5kZXggKiAzICsgMl07XHJcbiAgICAvLyAgIGFycltpICsgN10gPSAxO1xyXG4gICAgLy8gfVxyXG5cclxuICAgIGR0UG9zaXRpb24ubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgLy8gdXBkYXRlTGluZXMoKSB7XHJcbiAgLy9cclxuICAvLyAgIGxldCByZW5kZXJUYXJnZXQgPSB0aGlzLmdwdUNvbXB1dGUuZ2V0Q3VycmVudFJlbmRlclRhcmdldCh0aGlzLnBvc2l0aW9uVmFyaWFibGUpO1xyXG4gIC8vICAgbGV0IHdpZHRoID0gcmVuZGVyVGFyZ2V0LndpZHRoO1xyXG4gIC8vICAgbGV0IGhlaWdodCA9IHJlbmRlclRhcmdldC5oZWlnaHQ7XHJcbiAgLy8gICBsZXQgZGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkod2lkdGggKiBoZWlnaHQgKiA0KTtcclxuICAvLyAgIHRoaXMucmVuZGVyZXIucmVuZGVyZXIucmVhZFJlbmRlclRhcmdldFBpeGVscyhyZW5kZXJUYXJnZXQsIDAsIDAsIHdpZHRoLCBoZWlnaHQsIGRhdGEpO1xyXG4gIC8vICAgLy8gY29uc3QgcG9zaXRpb25zRGF0YSA9IHRoaXMubGluZXMuZ2VvbWV0cnkuYXR0cmlidXRlc1sncG9zaXRpb24nXS5hcnJheTtcclxuICAvLyAgIC8vXHJcbiAgLy8gICAvLyAvLyBEZWZpbmUgdGhlIHNpemUgb2YgeW91ciB3b3JsZFxyXG4gIC8vICAgLy8gbGV0IHdvcmxkU2l6ZSA9IG5ldyBWZWN0b3IzKDEwLCAxMCwgMTApOyAvLyBSZXBsYWNlIHdpdGggdGhlIHNpemUgb2YgeW91ciB3b3JsZFxyXG4gIC8vICAgLy9cclxuICAvLyAgIC8vXHJcbiAgLy8gICAvLyAvLyBDcmVhdGUgYW4gYXJyYXkgdG8gc3RvcmUgb3VyIG5ldyBwb3NpdGlvbnNcclxuICAvLyAgIC8vIGxldCBwb3NpdGlvbiA9IG5ldyBGbG9hdDMyQXJyYXkocG9zaXRpb25zRGF0YSk7ICAvLyBub3RlIHRoZSAqIDJcclxuICAvL1xyXG4gIC8vICAgLy8gY29uc3QgdmVydGV4RGF0YSA9IHRoaXMuYm94VGV4dHVyZS51c2VyRGF0YS52ZXJ0ZXhEYXRhO1xyXG4gIC8vICAgLy8gY29uc29sZS5sb2codmVydGV4RGF0YVswXSk7XHJcbiAgLy9cclxuICAvLyAgIGNvbnN0IHBvc2l0aW9uc0RhdGEgPSB0aGlzLnBvaW50cy5nZW9tZXRyeS5hdHRyaWJ1dGVzWydwb3NpdGlvbiddLmFycmF5Oy8vdGhpcy5tYXRlcmlhbC51bmlmb3Jtc1sncG9zaXRpb25zJ10udmFsdWUuaW1hZ2UuZGF0YTtcclxuICAvLyAgIC8vIGNvbnNvbGUubG9nKHBvc2l0aW9uc0RhdGFbMF0pO1xyXG4gIC8vXHJcbiAgLy9cclxuICAvL1xyXG4gIC8vICAgLy8gZm9yIChsZXQgaSA9IDA7IGkgPCBwb3NpdGlvbnNEYXRhLmxlbmd0aDsgaSArPSAzKSB7XHJcbiAgLy8gICAvLyAgIHBvc2l0aW9uW2kgKyAwXSA9IHZlcnRleERhdGFbaSAqIDNdOyAvLyBOb3JtYWxpemUgdG8gWzAsMV1cclxuICAvLyAgIC8vICAgcG9zaXRpb25baSArIDFdID0gdmVydGV4RGF0YVtpICogMyArIDFdOyAvLyBOb3JtYWxpemUgdG8gWzAsMV1cclxuICAvLyAgIC8vICAgcG9zaXRpb25baSArIDJdID0gdmVydGV4RGF0YVtpICogMyArIDJdOyAvLyBOb3JtYWxpemUgdG8gWzAsMV1cclxuICAvLyAgIC8vIH1cclxuICAvLyAgIC8vXHJcbiAgLy8gICB0aGlzLmxpbmVzLmdlb21ldHJ5LnNldEF0dHJpYnV0ZSgncG9zaXRpb24nLCBuZXcgQnVmZmVyQXR0cmlidXRlKHBvc2l0aW9uLCAzKSk7XHJcbiAgLy8gICB0aGlzLmxpbmVzLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAvLyB9XHJcbiAgdXBkYXRlTGluZXMoKSB7XHJcbiAgICAvLyBHZXQgdGhlIGN1cnJlbnQgdGV4dHVyZSBmcm9tIHRoZSBHUFUgY29tcHV0YXRpb25cclxuICAgIGxldCByZW5kZXJUYXJnZXQgPSB0aGlzLmdwdUNvbXB1dGUuZ2V0Q3VycmVudFJlbmRlclRhcmdldCh0aGlzLnBvc2l0aW9uVmFyaWFibGUpO1xyXG5cclxuICAgIC8vIFJlYWQgYmFjayB0aGUgdGV4dHVyZSBkYXRhXHJcbiAgICBsZXQgd2lkdGggPSByZW5kZXJUYXJnZXQud2lkdGg7XHJcbiAgICBsZXQgaGVpZ2h0ID0gcmVuZGVyVGFyZ2V0LmhlaWdodDtcclxuICAgIGxldCBkYXRhID0gbmV3IEZsb2F0MzJBcnJheSh3aWR0aCAqIGhlaWdodCAqIDQpO1xyXG4gICAgdGhpcy5yZW5kZXJlci5yZW5kZXJlci5yZWFkUmVuZGVyVGFyZ2V0UGl4ZWxzKHJlbmRlclRhcmdldCwgMCwgMCwgd2lkdGgsIGhlaWdodCwgZGF0YSk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgbmV3IEZsb2F0MzJBcnJheSB0byBzdG9yZSB0aGUgcG9zaXRpb25zXHJcbiAgICBsZXQgcG9zaXRpb25zID0gbmV3IEZsb2F0MzJBcnJheShkYXRhLmxlbmd0aCAvIDQgKiAzKTtcclxuXHJcbiAgICAvLyBMb29wIHRocm91Z2ggdGhlIGRhdGEgYW5kIHNldCB0aGUgcG9zaXRpb25zXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpICs9IDQpIHtcclxuICAgICAgcG9zaXRpb25zW2kgLyA0ICogM10gPSBkYXRhW2ldOyAgICAgIC8vIHhcclxuICAgICAgcG9zaXRpb25zW2kgLyA0ICogMyArIDFdID0gZGF0YVtpKzFdOyAvLyB5XHJcbiAgICAgIHBvc2l0aW9uc1tpIC8gNCAqIDMgKyAyXSA9IGRhdGFbaSsyXTsgLy8gelxyXG4gICAgfVxyXG5cclxuICAgIC8vIFNldCB0aGUgbmV3IHBvc2l0aW9ucyBpbiB0aGUgbGluZXMnIGdlb21ldHJ5XHJcbiAgICB0aGlzLmxpbmVzLmdlb21ldHJ5LnNldEF0dHJpYnV0ZSgncG9zaXRpb24nLCBuZXcgQnVmZmVyQXR0cmlidXRlKHBvc2l0aW9ucywgMykpO1xyXG4gICAgdGhpcy5saW5lcy5nZW9tZXRyeS5hdHRyaWJ1dGVzLnBvc2l0aW9uLm5lZWRzVXBkYXRlID0gdHJ1ZTsgLy8gSW5kaWNhdGUgdGhhdCB0aGUgcG9zaXRpb25zIG5lZWQgdG8gYmUgdXBkYXRlZFxyXG4gIH1cclxuXHJcblxyXG5cclxuICBsb2FkT2JqKHVybDogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcclxuICAgIGNvbnN0IGxvYWRlciA9IG5ldyBPQkpMb2FkZXIoKTtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgIHJldHVybiBsb2FkZXIubG9hZChcclxuICAgICAgICB1cmwsXHJcbiAgICAgICAgKHJlcykgPT4ge1xyXG4gICAgICAgICAgcmVzb2x2ZShyZXMpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgKHhocikgPT4ge1xyXG4gICAgICAgICAgLy8gY29uc29sZS5sb2coKHhoci5sb2FkZWQgLyB4aHIudG90YWwgKiAxMDApICsgJyUgbG9hZGVkJyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAoZXJyb3IpID0+IHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdBbiBlcnJvciBoYXBwZW5lZCcpO1xyXG4gICAgICAgICAgcmVqZWN0KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG5cclxufVxyXG4iXX0=