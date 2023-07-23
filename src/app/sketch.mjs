import { AdditiveBlending, BoxGeometry, BufferAttribute, BufferGeometry, DoubleSide, IcosahedronGeometry, Points, RepeatWrapping, ShaderMaterial, Vector4 } from 'three';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
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
    constructor(renderer) {
        this.renderer = renderer;
        this.isRunning = true;
        this.WIDTH = 624;
        this.maxDistance = 1.99;
        this.frequency = .5;
        this.amplitude = 1.5;
        this.normalizedTime = 0; // A variable to store the normalized time (between 0 and 1)
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
                time: { value: 0 },
                positions: { value: null },
                resolution: { value: new Vector4() },
                particleSpeed: { value: 2 }
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
                time: { value: 0 },
                positionTexture1: { value: null },
                positionTexture2: { value: null },
                resolution: { value: new Vector4() },
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
                time: { value: 0 },
                positionTexture1: { value: null },
                positionTexture2: { value: null },
                resolution: { value: new Vector4() },
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
        this.positionVariable.material.uniforms['positionTexture1'] = { value: this.initTexture };
        this.positionVariable.material.uniforms['positionTexture2'] = { value: this.initTexture };
        // Other uniforms
        this.positionVariable.material.uniforms['time'] = { value: 0.0 };
        this.positionVariable.material.uniforms['normalizedTime'] = { value: 0.0 };
        this.positionVariable.material.uniforms['particleSpeed'] = { value: 1.0 };
        this.positionVariable.material.uniforms['frequency'] = { value: this.frequency };
        this.positionVariable.material.uniforms['amplitude'] = { value: this.amplitude };
        this.positionVariable.material.uniforms['maxDistance'] = { value: this.maxDistance };
        this.gpuCompute.init();
    }
    createTexture(gpuCompute, geometry) {
        let dtPosition = gpuCompute.createTexture();
        this.fillPositionTexture(dtPosition, geometry);
        dtPosition.wrapS = RepeatWrapping;
        dtPosition.wrapT = RepeatWrapping;
        return dtPosition;
    }
    update(time) {
        // this.positionVariable.material.uniforms['time'] = {value: time};
        if (!this.positionVariable)
            return;
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
        dtPosition.needsUpdate = true;
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
            frequency: .25,
            duration: 2,
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
                this.positionVariable.material.uniforms['positionTexture1'] = { value: this.currentTexture };
                // this.gpuCompute.init();
            }
        });
    }
    onSphere() {
        const size = Math.random() * 3 + 6;
        const segments = Math.floor(Math.random() * 50) + 10;
        this.sphereTexture = this.createTexture(this.gpuCompute, new IcosahedronGeometry(size, segments));
        this.positionVariable.material.uniforms['positionTexture2'] = { value: this.sphereTexture };
        this.currentTexture = this.sphereTexture;
        this.morth();
    }
    onCube() {
        const size = Math.random() * 5 + 10;
        const segments = Math.floor(Math.random() * 50) + 10;
        this.boxTexture = this.createTexture(this.gpuCompute, new BoxGeometry(size, size, size, segments, segments, segments));
        this.positionVariable.material.uniforms['positionTexture2'] = { value: this.boxTexture };
        this.currentTexture = this.boxTexture;
        this.morth();
    }
    onFace() {
        this.faceTexture = this.createTexture(this.gpuCompute, this.geoFace);
        this.positionVariable.material.uniforms['positionTexture2'] = { value: this.faceTexture };
        this.currentTexture = this.faceTexture;
        this.morth();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2tldGNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2tldGNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFDTCxnQkFBZ0IsRUFDaEIsV0FBVyxFQUNYLGVBQWUsRUFDZixjQUFjLEVBRWQsVUFBVSxFQUNWLG1CQUFtQixFQUNuQixNQUFNLEVBQ04sY0FBYyxFQUVkLGNBQWMsRUFDZCxPQUFPLEVBQ1IsTUFBTSxPQUFPLENBQUM7QUFDZixPQUFPLEVBQUMsc0JBQXNCLEVBQVcsTUFBTSxnREFBZ0QsQ0FBQztBQUNoRyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sc0NBQXNDLENBQUM7QUFFL0QsYUFBYTtBQUNiLE9BQU8sTUFBTSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3JELGFBQWE7QUFDYixPQUFPLFFBQVEsTUFBTSxtQ0FBbUMsQ0FBQztBQUN6RCxhQUFhO0FBQ2IsdUVBQXVFO0FBQ3ZFLGFBQWE7QUFDYixPQUFPLG1CQUFtQixNQUFNLHFDQUFxQyxDQUFDO0FBQ3RFLE9BQU8sSUFBSSxNQUFNLE1BQU0sQ0FBQztBQUd4QixNQUFNLE9BQU8sTUFBTTtJQXlCakIsWUFBb0IsUUFBeUI7UUFBekIsYUFBUSxHQUFSLFFBQVEsQ0FBaUI7UUFyQjdDLGNBQVMsR0FBWSxJQUFJLENBQUM7UUFFMUIsVUFBSyxHQUFHLEdBQUcsQ0FBQztRQUtaLGdCQUFXLEdBQUcsSUFBSSxDQUFDO1FBQ25CLGNBQVMsR0FBRyxFQUFFLENBQUM7UUFDZixjQUFTLEdBQUcsR0FBRyxDQUFDO1FBTWhCLG1CQUFjLEdBQVcsQ0FBQyxDQUFDLENBQUMsNERBQTREO1FBT3RGLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdEIsSUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDO1FBQzVCLDBDQUEwQztRQUMxQyxnQ0FBZ0M7UUFFaEMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUVmLDRCQUE0QjtRQUM1QixxQ0FBcUM7UUFDckMsa0RBQWtEO1FBQ2xELHNCQUFzQjtRQUN0QiwwQ0FBMEM7UUFDMUMscUZBQXFGO1FBQ3JGLDBDQUEwQztRQUMxQyw0REFBNEQ7UUFDNUQsOEhBQThIO1FBQzlILHlHQUF5RztRQUN6RyxtSEFBbUg7UUFDbkgsNkVBQTZFO1FBQzdFLHNGQUFzRjtRQUN0RixpQ0FBaUM7UUFDakMsTUFBTTtRQUNOLE1BQU07UUFFTixrQkFBa0I7UUFDbEIsb0JBQW9CO0lBQ3RCLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTztRQUVYLE1BQU0sUUFBUSxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7UUFDdEMsSUFBSSxTQUFTLEdBQUcsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzlELElBQUksU0FBUyxHQUFHLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztRQUM5RCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ2hELElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUN0QixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDdEIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3RCLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQ3ZDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQ3ZDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNoQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztTQUNoQztRQUVELFFBQVEsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLElBQUksZUFBZSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JFLFFBQVEsQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLElBQUksZUFBZSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXRFLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxjQUFjLENBQUM7WUFDakMsVUFBVSxFQUFFO2dCQUNWLFdBQVcsRUFBRSxJQUFJO2FBQ2xCO1lBQ0QsUUFBUSxFQUFFO2dCQUNSLElBQUksRUFBRSxFQUFDLEtBQUssRUFBRSxDQUFDLEVBQUM7Z0JBQ2hCLFNBQVMsRUFBRSxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUM7Z0JBQ3hCLFVBQVUsRUFBRSxFQUFDLEtBQUssRUFBRSxJQUFJLE9BQU8sRUFBRSxFQUFDO2dCQUNsQyxhQUFhLEVBQUUsRUFBQyxLQUFLLEVBQUUsQ0FBQyxFQUFDO2FBQzFCO1lBQ0QsUUFBUSxFQUFFLGdCQUFnQjtZQUMxQixTQUFTLEVBQUUsSUFBSTtZQUNmLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLElBQUksRUFBRSxVQUFVO1lBQ2hCLFlBQVksRUFBRSxNQUFNO1lBQ3BCLGNBQWMsRUFBRSxRQUFRO1lBQ3hCLFlBQVksRUFBRSxJQUFJO1NBQ25CLENBQUMsQ0FBQztRQUVILE1BQU0sSUFBSSxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkIsQ0FBQztJQUVELFNBQVM7UUFDUCxNQUFNLFFBQVEsR0FBRyxJQUFJLG1CQUFtQixDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNoRCxJQUFJLFNBQVMsR0FBRyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDOUQsSUFBSSxTQUFTLEdBQUcsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRTlELElBQUksVUFBVSxHQUFHLFFBQVEsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ3pELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDaEQseUNBQXlDO1lBQ3pDLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXRFLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMscUJBQXFCO1lBQ2hGLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxxQkFBcUI7WUFDeEYsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLFdBQVcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLHFCQUFxQjtZQUN4RixTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDdEY7UUFFRCxzREFBc0Q7UUFDdEQsMkJBQTJCO1FBQzNCLDJCQUEyQjtRQUMzQiwyQkFBMkI7UUFDM0IsNERBQTREO1FBQzVELDREQUE0RDtRQUM1RCxxQ0FBcUM7UUFDckMsb0NBQW9DO1FBQ3BDLElBQUk7UUFDSixRQUFRLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxJQUFJLGVBQWUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyRSxRQUFRLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxJQUFJLGVBQWUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0RSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksY0FBYyxDQUFDO1lBQ2pDLFVBQVUsRUFBRTtnQkFDVixXQUFXLEVBQUUsSUFBSTthQUNsQjtZQUNELFFBQVEsRUFBRTtnQkFDUixJQUFJLEVBQUUsRUFBQyxLQUFLLEVBQUUsQ0FBQyxFQUFDO2dCQUNoQixnQkFBZ0IsRUFBRSxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUM7Z0JBQy9CLGdCQUFnQixFQUFFLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBQztnQkFDL0IsVUFBVSxFQUFFLEVBQUMsS0FBSyxFQUFFLElBQUksT0FBTyxFQUFFLEVBQUM7YUFDbkM7WUFDRCxJQUFJLEVBQUUsVUFBVTtZQUNoQixZQUFZLEVBQUUsTUFBTTtZQUNwQixjQUFjLEVBQUUsUUFBUTtTQUN6QixDQUFDLENBQUM7UUFDSCw2RUFBNkU7UUFFN0UsTUFBTSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNuRCxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU87UUFFWCxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUNuRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztRQUd0QyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksY0FBYyxDQUFDO1lBQ2pDLFVBQVUsRUFBRTtnQkFDVixXQUFXLEVBQUUsSUFBSTthQUNsQjtZQUNELFFBQVEsRUFBRTtnQkFDUixJQUFJLEVBQUUsRUFBQyxLQUFLLEVBQUUsQ0FBQyxFQUFDO2dCQUNoQixnQkFBZ0IsRUFBRSxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUM7Z0JBQy9CLGdCQUFnQixFQUFFLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBQztnQkFDL0IsVUFBVSxFQUFFLEVBQUMsS0FBSyxFQUFFLElBQUksT0FBTyxFQUFFLEVBQUM7YUFDbkM7WUFDRCxJQUFJLEVBQUUsVUFBVTtZQUNoQixZQUFZLEVBQUUsTUFBTTtZQUNwQixjQUFjLEVBQUUsUUFBUTtTQUN6QixDQUFDLENBQUM7UUFFSCxNQUFNLElBQUksR0FBRyxJQUFJLE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxLQUFLLENBQUMsY0FBYztRQUVsQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksc0JBQXNCLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFN0YsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDbkQsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztRQUV6QyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDckUsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxXQUFXLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQy9GLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksbUJBQW1CLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDekYsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ3BDLHNEQUFzRDtRQUN0RCx1REFBdUQ7UUFDdkQsMkNBQTJDO1FBQzNDLDJDQUEyQztRQUMzQyxFQUFFO1FBQ0YsRUFBRTtRQUNGLHFEQUFxRDtRQUNyRCxzRkFBc0Y7UUFDdEYsMENBQTBDO1FBQzFDLDBDQUEwQztRQUMxQyxFQUFFO1FBQ0YsRUFBRTtRQUNGLHdEQUF3RDtRQUN4RCxnRkFBZ0Y7UUFDaEYsNkNBQTZDO1FBQzdDLDZDQUE2QztRQUc3Qyw4RUFBOEU7UUFFOUUsc0RBQXNEO1FBQ3RELDZDQUE2QztRQUM3Qyx1REFBdUQ7UUFFdkQsd0JBQXdCO1FBQ3hCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsRUFBRSxtQkFBbUIsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFOUcsZ0NBQWdDO1FBQ2hDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsRUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBQyxDQUFDO1FBQ3hGLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsRUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBQyxDQUFDO1FBRXhGLGlCQUFpQjtRQUNqQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFDLEtBQUssRUFBRSxHQUFHLEVBQUMsQ0FBQztRQUMvRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUMsS0FBSyxFQUFFLEdBQUcsRUFBQyxDQUFDO1FBQ3pFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUMsS0FBSyxFQUFFLEdBQUcsRUFBQyxDQUFDO1FBQ3hFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUMsQ0FBQztRQUMvRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFDLENBQUM7UUFDL0UsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBQyxDQUFDO1FBRW5GLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUVELGFBQWEsQ0FBQyxVQUFrQyxFQUFFLFFBQXdCO1FBQ3hFLElBQUksVUFBVSxHQUFHLFVBQVUsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUM1QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQy9DLFVBQVUsQ0FBQyxLQUFLLEdBQUcsY0FBYyxDQUFDO1FBQ2xDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsY0FBYyxDQUFDO1FBQ2xDLE9BQU8sVUFBVSxDQUFDO0lBQ3BCLENBQUM7SUFFRCxNQUFNLENBQUMsSUFBWTtRQUVqQixtRUFBbUU7UUFDbkUsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0I7WUFBRSxPQUFPO1FBQ25DLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDN0QsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztRQUN0RixJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUM1RSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUU1RSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzFCLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUNsSCw2SEFBNkg7UUFDN0gseURBQXlEO1FBQ3pELCtCQUErQjtRQUUvQixrRkFBa0Y7UUFDbEYsa0ZBQWtGO1FBR2xGLCtDQUErQztRQUMvQyx1REFBdUQ7SUFDekQsQ0FBQztJQUVELG1CQUFtQixDQUFDLFVBQXVCLEVBQUUsUUFBYTtRQUV4RCxJQUFJLEdBQUcsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztRQUVoQyxJQUFJLFVBQVUsR0FBRyxRQUFRLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUV6RCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3RDLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLHFCQUFxQjtZQUMvRCxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMscUJBQXFCO1lBQ25FLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLFdBQVcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxxQkFBcUI7WUFDbkUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDaEI7UUFDRCxVQUFVLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztJQUNoQyxDQUFDO0lBRUQsT0FBTyxDQUFDLEdBQVc7UUFDakIsTUFBTSxNQUFNLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQztRQUMvQixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ3JDLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FDaEIsR0FBRyxFQUNILENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQ04sT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2YsQ0FBQyxFQUNELENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQ04sNERBQTREO1lBQzlELENBQUMsRUFDRCxDQUFDLEtBQUssRUFBRSxFQUFFO2dCQUNSLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQztnQkFDakMsTUFBTSxFQUFFLENBQUM7WUFDWCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELEtBQUs7UUFFSCxzQkFBc0I7UUFDdEIsa0JBQWtCO1FBQ2xCLG1CQUFtQjtRQUVuQixJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQztRQUN4QixNQUFNLEdBQUcsR0FBRztZQUNWLGNBQWMsRUFBRSxDQUFDO1lBQ2pCLFNBQVMsRUFBRSxHQUFHO1lBQ2QsU0FBUyxFQUFFLEVBQUU7U0FDZCxDQUFDO1FBQ0YsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUU7WUFDWCxjQUFjLEVBQUUsQ0FBQztZQUNqQixTQUFTLEVBQUUsR0FBRztZQUNkLFNBQVMsRUFBRSxHQUFHO1lBQ1osUUFBUSxFQUFFLENBQUM7WUFDYixJQUFJLEVBQUUsY0FBYztZQUNwQixjQUFjO1lBQ2QsY0FBYztZQUNkLFFBQVEsRUFBRSxHQUFHLEVBQUU7Z0JBQ2Isc0NBQXNDO2dCQUN0QyxpRkFBaUY7Z0JBQ2pGLHNDQUFzQztnQkFDdEMsd0RBQXdEO2dCQUN4RCwwSEFBMEg7Z0JBQzFILHFHQUFxRztnQkFDckcsK0dBQStHO2dCQUMvRyx5RUFBeUU7Z0JBQ3pFLGtGQUFrRjtnQkFDbEYsMEJBQTBCO1lBQzVCLENBQUM7WUFDRCxRQUFRLEVBQUUsR0FBRyxFQUFFO2dCQUNiLElBQUksQ0FBQyxjQUFjLEdBQUcsR0FBRyxDQUFDLGNBQWMsQ0FBQztnQkFDekMsSUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDO2dCQUMvQixJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUM7WUFDakMsQ0FBQztZQUNELFVBQVUsRUFBRSxHQUFHLEVBQUU7Z0JBQ2YsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsR0FBRyxFQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFDLENBQUM7Z0JBQzNGLDBCQUEwQjtZQUM1QixDQUFDO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELFFBQVE7UUFDTixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNuQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDckQsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUNsRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUMsQ0FBQztRQUMxRixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDekMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ2YsQ0FBQztJQUVELE1BQU07UUFDSixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNwQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDckQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ3ZILElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsRUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBQyxDQUFDO1FBQ3ZGLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUN0QyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDZixDQUFDO0lBRUQsTUFBTTtRQUNKLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNyRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUMsQ0FBQztRQUN4RixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDdkMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ2YsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtSZW5kZXJlclNlcnZpY2V9IGZyb20gJy4vcmVuZGVyZXIuc2VydmljZSc7XHJcbmltcG9ydCB7XHJcbiAgQWRkaXRpdmVCbGVuZGluZyxcclxuICBCb3hHZW9tZXRyeSxcclxuICBCdWZmZXJBdHRyaWJ1dGUsXHJcbiAgQnVmZmVyR2VvbWV0cnksXHJcbiAgRGF0YVRleHR1cmUsXHJcbiAgRG91YmxlU2lkZSxcclxuICBJY29zYWhlZHJvbkdlb21ldHJ5LFxyXG4gIFBvaW50cyxcclxuICBSZXBlYXRXcmFwcGluZyxcclxuICBTY2VuZSxcclxuICBTaGFkZXJNYXRlcmlhbCxcclxuICBWZWN0b3I0XHJcbn0gZnJvbSAndGhyZWUnO1xyXG5pbXBvcnQge0dQVUNvbXB1dGF0aW9uUmVuZGVyZXIsIFZhcmlhYmxlfSBmcm9tICd0aHJlZS9leGFtcGxlcy9qc20vbWlzYy9HUFVDb21wdXRhdGlvblJlbmRlcmVyJztcclxuaW1wb3J0IHtPQkpMb2FkZXJ9IGZyb20gJ3RocmVlL2V4YW1wbGVzL2pzbS9sb2FkZXJzL09CSkxvYWRlcic7XHJcblxyXG4vLyBAdHMtaWdub3JlXHJcbmltcG9ydCB2ZXJ0ZXggZnJvbSAnLi9zaGFkZXJzL3ZlcnRleC1wYXJ0aWNsZXMuZ2xzbCc7XHJcbi8vIEB0cy1pZ25vcmVcclxuaW1wb3J0IGZyYWdtZW50IGZyb20gJy4vc2hhZGVycy9mcmFnbWVudC1wYXJ0aWNsZXMuZ2xzbCc7XHJcbi8vIEB0cy1pZ25vcmVcclxuLy8gaW1wb3J0IGZyYWdtZW50U2ltdWxhdGlvbiBmcm9tICcuL3NoYWRlcnMvZnJhZ21lbnQtc2ltdWxhdGlvbi5nbHNsJztcclxuLy8gQHRzLWlnbm9yZVxyXG5pbXBvcnQgZnJhZ21lbnRTaW11bGF0aW9uMiBmcm9tICcuL3NoYWRlcnMvZnJhZ21lbnQtc2ltdWxhdGlvbjIuZ2xzbCc7XHJcbmltcG9ydCBnc2FwIGZyb20gJ2dzYXAnO1xyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBTa2V0Y2gge1xyXG5cclxuICBjdXJyZW50U2hhcGU6IGFueTtcclxuICBzY2VuZSE6IFNjZW5lO1xyXG4gIGlzUnVubmluZzogYm9vbGVhbiA9IHRydWU7XHJcbiAgZ3B1Q29tcHV0ZSE6IEdQVUNvbXB1dGF0aW9uUmVuZGVyZXI7XHJcbiAgV0lEVEggPSA2MjQ7XHJcbiAgZHRQb3NpdGlvbjEhOiBEYXRhVGV4dHVyZTtcclxuICBkdFBvc2l0aW9uMiE6IERhdGFUZXh0dXJlO1xyXG4gIHBvc2l0aW9uVmFyaWFibGUhOiBWYXJpYWJsZTtcclxuICBtYXRlcmlhbCE6IGFueTtcclxuICBtYXhEaXN0YW5jZSA9IDEuOTk7XHJcbiAgZnJlcXVlbmN5ID0gLjU7XHJcbiAgYW1wbGl0dWRlID0gMS41O1xyXG5cclxuICBmYWNlVGV4dHVyZSE6IERhdGFUZXh0dXJlO1xyXG4gIHNwaGVyZVRleHR1cmUhOiBEYXRhVGV4dHVyZTtcclxuICBib3hUZXh0dXJlITogRGF0YVRleHR1cmU7XHJcblxyXG4gIG5vcm1hbGl6ZWRUaW1lOiBudW1iZXIgPSAwOyAvLyBBIHZhcmlhYmxlIHRvIHN0b3JlIHRoZSBub3JtYWxpemVkIHRpbWUgKGJldHdlZW4gMCBhbmQgMSlcclxuICBpbml0VGV4dHVyZSE6IERhdGFUZXh0dXJlO1xyXG4gIGN1cnJlbnQ6IGFueTtcclxuICBwcml2YXRlIGdlb0ZhY2U6IGFueTtcclxuICBwcml2YXRlIGN1cnJlbnRUZXh0dXJlOiBhbnk7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVuZGVyZXI6IFJlbmRlcmVyU2VydmljZSkge1xyXG4gICAgY29uc29sZS5sb2coJ1NrZXRjaCcpO1xyXG4gICAgdGhpcy5zY2VuZSA9IHJlbmRlcmVyLnNjZW5lO1xyXG4gICAgLy8gY29uc3QgYXhlc0hlbHBlciA9IG5ldyBBeGVzSGVscGVyKCA1ICk7XHJcbiAgICAvLyB0aGlzLnNjZW5lLmFkZCggYXhlc0hlbHBlciApO1xyXG5cclxuICAgIHRoaXMuaW5pdEdwdUNvbXB1dGUoKTtcclxuICAgIHRoaXMuYWRkTWVzaCgpO1xyXG5cclxuICAgIC8vIGNvbnN0IHQgPSBnc2FwLnRvKHRoaXMsIHtcclxuICAgIC8vICAgbm9ybWFsaXplZFRpbWU6IDEsIGR1cmF0aW9uOiAxMCxcclxuICAgIC8vICAgZWFzZTogJ3Bvd2VyMy5pbk91dCcsIHJlcGVhdDogLTEsIHlveW86IHRydWUsXHJcbiAgICAvLyAgIG9uUmVwZWF0OiAoKSA9PiB7XHJcbiAgICAvLyAgICAgaWYgKCF0aGlzLnBvc2l0aW9uVmFyaWFibGUpIHJldHVybjtcclxuICAgIC8vICAgICAvLyB0aGlzLmZpbGxQb3NpdGlvblRleHR1cmUodGhpcy5kdFBvc2l0aW9uMSwgbmV3IEljb3NhaGVkcm9uR2VvbWV0cnkoNywgNTApKTtcclxuICAgIC8vICAgICBjb25zdCBzaXplID0gTWF0aC5yYW5kb20oKSAqIDcgKyAzO1xyXG4gICAgLy8gICAgIGNvbnN0IHNlZ21lbnRzID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNTApICsgMTA7XHJcbiAgICAvLyAgICAgdGhpcy5ib3hUZXh0dXJlID0gdGhpcy5jcmVhdGVUZXh0dXJlKHRoaXMuZ3B1Q29tcHV0ZSwgbmV3IEJveEdlb21ldHJ5KHNpemUsIHNpemUsIHNpemUsIHNlZ21lbnRzLCBzZWdtZW50cywgc2VnbWVudHMpKTtcclxuICAgIC8vICAgICB0aGlzLnNwaGVyZVRleHR1cmUgPSB0aGlzLmNyZWF0ZVRleHR1cmUodGhpcy5ncHVDb21wdXRlLCBuZXcgSWNvc2FoZWRyb25HZW9tZXRyeShzaXplLCBzZWdtZW50cykpO1xyXG4gICAgLy8gICAgIGNvbnN0IHRleHR1cmVzID0gW3RoaXMuZmFjZVRleHR1cmUsIHRoaXMuYm94VGV4dHVyZSwgdGhpcy5zcGhlcmVUZXh0dXJlLCB0aGlzLmJveFRleHR1cmUsIHRoaXMuZmFjZVRleHR1cmVdO1xyXG4gICAgLy8gICAgIGNvbnN0IHRleHR1cmUgPSB0ZXh0dXJlc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB0ZXh0dXJlcy5sZW5ndGgpXTtcclxuICAgIC8vICAgICB0aGlzLnBvc2l0aW9uVmFyaWFibGUubWF0ZXJpYWwudW5pZm9ybXNbJ3Bvc2l0aW9uVGV4dHVyZTInXSA9IHt2YWx1ZTogdGV4dHVyZX07XHJcbiAgICAvLyAgICAgLy8gdGhpcy5ncHVDb21wdXRlLmluaXQoKTtcclxuICAgIC8vICAgfVxyXG4gICAgLy8gfSk7XHJcblxyXG4gICAgLy8gdGhpcy5hZGRGYWNlKCk7XHJcbiAgICAvLyB0aGlzLmFkZFNwaGVyZSgpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgYWRkTWVzaCgpIHtcclxuXHJcbiAgICBjb25zdCBnZW9tZXRyeSA9IG5ldyBCdWZmZXJHZW9tZXRyeSgpO1xyXG4gICAgbGV0IHBvc2l0aW9ucyA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5XSURUSCAqIHRoaXMuV0lEVEggKiAzKTtcclxuICAgIGxldCByZWZlcmVuY2UgPSBuZXcgRmxvYXQzMkFycmF5KHRoaXMuV0lEVEggKiB0aGlzLldJRFRIICogMik7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuV0lEVEggKiB0aGlzLldJRFRIOyBpKyspIHtcclxuICAgICAgbGV0IHggPSBNYXRoLnJhbmRvbSgpO1xyXG4gICAgICBsZXQgeSA9IE1hdGgucmFuZG9tKCk7XHJcbiAgICAgIGxldCB6ID0gTWF0aC5yYW5kb20oKTtcclxuICAgICAgbGV0IHh4ID0gKGkgJSB0aGlzLldJRFRIKSAvIHRoaXMuV0lEVEg7XHJcbiAgICAgIGxldCB5eSA9IChpIC8gdGhpcy5XSURUSCkgLyB0aGlzLldJRFRIO1xyXG4gICAgICBwb3NpdGlvbnMuc2V0KFt4LCB5LCB6XSwgaSAqIDMpO1xyXG4gICAgICByZWZlcmVuY2Uuc2V0KFt4eCwgeXldLCBpICogMik7XHJcbiAgICB9XHJcblxyXG4gICAgZ2VvbWV0cnkuc2V0QXR0cmlidXRlKCdwb3NpdGlvbicsIG5ldyBCdWZmZXJBdHRyaWJ1dGUocG9zaXRpb25zLCAzKSk7XHJcbiAgICBnZW9tZXRyeS5zZXRBdHRyaWJ1dGUoJ3JlZmVyZW5jZScsIG5ldyBCdWZmZXJBdHRyaWJ1dGUocmVmZXJlbmNlLCAyKSk7XHJcblxyXG4gICAgdGhpcy5tYXRlcmlhbCA9IG5ldyBTaGFkZXJNYXRlcmlhbCh7XHJcbiAgICAgIGV4dGVuc2lvbnM6IHtcclxuICAgICAgICBkZXJpdmF0aXZlczogdHJ1ZVxyXG4gICAgICB9LFxyXG4gICAgICB1bmlmb3Jtczoge1xyXG4gICAgICAgIHRpbWU6IHt2YWx1ZTogMH0sXHJcbiAgICAgICAgcG9zaXRpb25zOiB7dmFsdWU6IG51bGx9LFxyXG4gICAgICAgIHJlc29sdXRpb246IHt2YWx1ZTogbmV3IFZlY3RvcjQoKX0sXHJcbiAgICAgICAgcGFydGljbGVTcGVlZDoge3ZhbHVlOiAyfVxyXG4gICAgICB9LFxyXG4gICAgICBibGVuZGluZzogQWRkaXRpdmVCbGVuZGluZyxcclxuICAgICAgZGVwdGhUZXN0OiB0cnVlLFxyXG4gICAgICBkZXB0aFdyaXRlOiBmYWxzZSxcclxuICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsXHJcbiAgICAgIHNpZGU6IERvdWJsZVNpZGUsXHJcbiAgICAgIHZlcnRleFNoYWRlcjogdmVydGV4LFxyXG4gICAgICBmcmFnbWVudFNoYWRlcjogZnJhZ21lbnQsXHJcbiAgICAgIHZlcnRleENvbG9yczogdHJ1ZVxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgbWVzaCA9IG5ldyBQb2ludHMoZ2VvbWV0cnksIHRoaXMubWF0ZXJpYWwpO1xyXG4gICAgdGhpcy5zY2VuZS5hZGQobWVzaCk7XHJcbiAgfVxyXG5cclxuICBhZGRTcGhlcmUoKSB7XHJcbiAgICBjb25zdCBnZW9tZXRyeSA9IG5ldyBJY29zYWhlZHJvbkdlb21ldHJ5KDEsIDEwKTtcclxuICAgIGxldCBwb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KHRoaXMuV0lEVEggKiB0aGlzLldJRFRIICogMyk7XHJcbiAgICBsZXQgcmVmZXJlbmNlID0gbmV3IEZsb2F0MzJBcnJheSh0aGlzLldJRFRIICogdGhpcy5XSURUSCAqIDIpO1xyXG5cclxuICAgIGxldCB2ZXJ0ZXhEYXRhID0gZ2VvbWV0cnkuZ2V0QXR0cmlidXRlKCdwb3NpdGlvbicpLmFycmF5O1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLldJRFRIICogdGhpcy5XSURUSDsgaSsrKSB7XHJcbiAgICAgIC8vIFBpY2sgYSByYW5kb20gdmVydGV4IGZyb20gdGhlIGdlb21ldHJ5XHJcbiAgICAgIGxldCB2ZXJ0ZXhJbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICh2ZXJ0ZXhEYXRhLmxlbmd0aCAvIDMpKTtcclxuXHJcbiAgICAgIHBvc2l0aW9uc1tpICogM10gPSB2ZXJ0ZXhEYXRhW3ZlcnRleEluZGV4ICogM10gLyAyMCArIDAuNTsgLy8gTm9ybWFsaXplIHRvIFswLDFdXHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDFdID0gdmVydGV4RGF0YVt2ZXJ0ZXhJbmRleCAqIDMgKyAxXSAvIDIwICsgMC41OyAvLyBOb3JtYWxpemUgdG8gWzAsMV1cclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMl0gPSB2ZXJ0ZXhEYXRhW3ZlcnRleEluZGV4ICogMyArIDJdIC8gMjAgKyAwLjU7IC8vIE5vcm1hbGl6ZSB0byBbMCwxXVxyXG4gICAgICByZWZlcmVuY2Uuc2V0KFsoaSAlIHRoaXMuV0lEVEgpIC8gdGhpcy5XSURUSCwgKGkgLyB0aGlzLldJRFRIKSAvIHRoaXMuV0lEVEhdLCBpICogMik7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLldJRFRIICogdGhpcy5XSURUSDsgaSsrKSB7XHJcbiAgICAvLyAgIGxldCB4ID0gTWF0aC5yYW5kb20oKTtcclxuICAgIC8vICAgbGV0IHkgPSBNYXRoLnJhbmRvbSgpO1xyXG4gICAgLy8gICBsZXQgeiA9IE1hdGgucmFuZG9tKCk7XHJcbiAgICAvLyAgIGxldCB4eCA9IE1hdGgucmFuZG9tKCk7Ly8oaSAlIHRoaXMuV0lEVEgpIC8gdGhpcy5XSURUSDtcclxuICAgIC8vICAgbGV0IHl5ID0gTWF0aC5yYW5kb20oKTsvLyhpIC8gdGhpcy5XSURUSCkgLyB0aGlzLldJRFRIO1xyXG4gICAgLy8gICBwb3NpdGlvbnMuc2V0KFt4LCB5LCB6XSwgaSAqIDMpO1xyXG4gICAgLy8gICByZWZlcmVuY2Uuc2V0KFt4eCwgeXldLCBpICogMik7XHJcbiAgICAvLyB9XHJcbiAgICBnZW9tZXRyeS5zZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJywgbmV3IEJ1ZmZlckF0dHJpYnV0ZShwb3NpdGlvbnMsIDMpKTtcclxuICAgIGdlb21ldHJ5LnNldEF0dHJpYnV0ZSgncmVmZXJlbmNlJywgbmV3IEJ1ZmZlckF0dHJpYnV0ZShyZWZlcmVuY2UsIDIpKTtcclxuICAgIHRoaXMubWF0ZXJpYWwgPSBuZXcgU2hhZGVyTWF0ZXJpYWwoe1xyXG4gICAgICBleHRlbnNpb25zOiB7XHJcbiAgICAgICAgZGVyaXZhdGl2ZXM6IHRydWVcclxuICAgICAgfSxcclxuICAgICAgdW5pZm9ybXM6IHtcclxuICAgICAgICB0aW1lOiB7dmFsdWU6IDB9LFxyXG4gICAgICAgIHBvc2l0aW9uVGV4dHVyZTE6IHt2YWx1ZTogbnVsbH0sXHJcbiAgICAgICAgcG9zaXRpb25UZXh0dXJlMjoge3ZhbHVlOiBudWxsfSxcclxuICAgICAgICByZXNvbHV0aW9uOiB7dmFsdWU6IG5ldyBWZWN0b3I0KCl9LFxyXG4gICAgICB9LFxyXG4gICAgICBzaWRlOiBEb3VibGVTaWRlLFxyXG4gICAgICB2ZXJ0ZXhTaGFkZXI6IHZlcnRleCxcclxuICAgICAgZnJhZ21lbnRTaGFkZXI6IGZyYWdtZW50XHJcbiAgICB9KTtcclxuICAgIC8vIHRoaXMubWF0ZXJpYWwgPSBuZXcgTWVzaEJhc2ljTWF0ZXJpYWwoe2NvbG9yOiAweGZmMDAwMCwgd2lyZWZyYW1lOiB0cnVlfSk7XHJcblxyXG4gICAgY29uc3Qgc3BoZXJlID0gbmV3IFBvaW50cyhnZW9tZXRyeSwgdGhpcy5tYXRlcmlhbCk7XHJcbiAgICB0aGlzLnNjZW5lLmFkZChzcGhlcmUpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgYWRkRmFjZSgpIHtcclxuXHJcbiAgICBjb25zdCBmYWNlID0gYXdhaXQgdGhpcy5sb2FkT2JqKCdhc3NldHMvZmFjZS5vYmonKTtcclxuICAgIGNvbnN0IGdlbyA9IGZhY2UuY2hpbGRyZW5bMF0uZ2VvbWV0cnk7XHJcblxyXG5cclxuICAgIHRoaXMubWF0ZXJpYWwgPSBuZXcgU2hhZGVyTWF0ZXJpYWwoe1xyXG4gICAgICBleHRlbnNpb25zOiB7XHJcbiAgICAgICAgZGVyaXZhdGl2ZXM6IHRydWVcclxuICAgICAgfSxcclxuICAgICAgdW5pZm9ybXM6IHtcclxuICAgICAgICB0aW1lOiB7dmFsdWU6IDB9LFxyXG4gICAgICAgIHBvc2l0aW9uVGV4dHVyZTE6IHt2YWx1ZTogbnVsbH0sXHJcbiAgICAgICAgcG9zaXRpb25UZXh0dXJlMjoge3ZhbHVlOiBudWxsfSxcclxuICAgICAgICByZXNvbHV0aW9uOiB7dmFsdWU6IG5ldyBWZWN0b3I0KCl9LFxyXG4gICAgICB9LFxyXG4gICAgICBzaWRlOiBEb3VibGVTaWRlLFxyXG4gICAgICB2ZXJ0ZXhTaGFkZXI6IHZlcnRleCxcclxuICAgICAgZnJhZ21lbnRTaGFkZXI6IGZyYWdtZW50XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBtZXNoID0gbmV3IFBvaW50cyhnZW8sIHRoaXMubWF0ZXJpYWwpO1xyXG4gICAgdGhpcy5zY2VuZS5hZGQobWVzaCk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBpbml0R3B1Q29tcHV0ZSgpIHtcclxuXHJcbiAgICB0aGlzLmdwdUNvbXB1dGUgPSBuZXcgR1BVQ29tcHV0YXRpb25SZW5kZXJlcih0aGlzLldJRFRILCB0aGlzLldJRFRILCB0aGlzLnJlbmRlcmVyLnJlbmRlcmVyKTtcclxuXHJcbiAgICBjb25zdCBmYWNlID0gYXdhaXQgdGhpcy5sb2FkT2JqKCdhc3NldHMvZmFjZS5vYmonKTtcclxuICAgIHRoaXMuZ2VvRmFjZSA9IGZhY2UuY2hpbGRyZW5bMF0uZ2VvbWV0cnk7XHJcblxyXG4gICAgdGhpcy5mYWNlVGV4dHVyZSA9IHRoaXMuY3JlYXRlVGV4dHVyZSh0aGlzLmdwdUNvbXB1dGUsIHRoaXMuZ2VvRmFjZSk7XHJcbiAgICB0aGlzLmJveFRleHR1cmUgPSB0aGlzLmNyZWF0ZVRleHR1cmUodGhpcy5ncHVDb21wdXRlLCBuZXcgQm94R2VvbWV0cnkoMTAsIDEwLCAxMCwgNTAsIDUwLCA1MCkpO1xyXG4gICAgdGhpcy5zcGhlcmVUZXh0dXJlID0gdGhpcy5jcmVhdGVUZXh0dXJlKHRoaXMuZ3B1Q29tcHV0ZSwgbmV3IEljb3NhaGVkcm9uR2VvbWV0cnkoNywgNTApKTtcclxuICAgIHRoaXMuaW5pdFRleHR1cmUgPSB0aGlzLmZhY2VUZXh0dXJlO1xyXG4gICAgLy8gdGhpcy5mYWNlVGV4dHVyZSA9IHRoaXMuZ3B1Q29tcHV0ZS5jcmVhdGVUZXh0dXJlKCk7XHJcbiAgICAvLyB0aGlzLmZpbGxQb3NpdGlvblRleHR1cmUodGhpcy5mYWNlVGV4dHVyZSwgZ2VvVGVzdCk7XHJcbiAgICAvLyB0aGlzLmZhY2VUZXh0dXJlLndyYXBTID0gUmVwZWF0V3JhcHBpbmc7XHJcbiAgICAvLyB0aGlzLmZhY2VUZXh0dXJlLndyYXBUID0gUmVwZWF0V3JhcHBpbmc7XHJcbiAgICAvL1xyXG4gICAgLy9cclxuICAgIC8vIHRoaXMuYm94VGV4dHVyZSA9IHRoaXMuZ3B1Q29tcHV0ZS5jcmVhdGVUZXh0dXJlKCk7XHJcbiAgICAvLyB0aGlzLmZpbGxQb3NpdGlvblRleHR1cmUodGhpcy5ib3hUZXh0dXJlLCBuZXcgQm94R2VvbWV0cnkoMTAsIDEwLCAxMCwgNTAsIDUwLCA1MCkpO1xyXG4gICAgLy8gdGhpcy5ib3hUZXh0dXJlLndyYXBTID0gUmVwZWF0V3JhcHBpbmc7XHJcbiAgICAvLyB0aGlzLmJveFRleHR1cmUud3JhcFQgPSBSZXBlYXRXcmFwcGluZztcclxuICAgIC8vXHJcbiAgICAvL1xyXG4gICAgLy8gdGhpcy5zcGhlcmVUZXh0dXJlID0gdGhpcy5ncHVDb21wdXRlLmNyZWF0ZVRleHR1cmUoKTtcclxuICAgIC8vIHRoaXMuZmlsbFBvc2l0aW9uVGV4dHVyZSh0aGlzLnNwaGVyZVRleHR1cmUsIG5ldyBJY29zYWhlZHJvbkdlb21ldHJ5KDcsIDUwKSk7XHJcbiAgICAvLyB0aGlzLnNwaGVyZVRleHR1cmUud3JhcFMgPSBSZXBlYXRXcmFwcGluZztcclxuICAgIC8vIHRoaXMuc3BoZXJlVGV4dHVyZS53cmFwVCA9IFJlcGVhdFdyYXBwaW5nO1xyXG5cclxuXHJcbiAgICAvLyB0aGlzLmZpbGxQb3NpdGlvblRleHR1cmUodGhpcy5kdFBvc2l0aW9uMiwgbmV3IEljb3NhaGVkcm9uR2VvbWV0cnkoNywgNTApKTtcclxuXHJcbiAgICAvLyBjb25zdCBmYWNlID0gYXdhaXQgdGhpcy5sb2FkT2JqKCdhc3NldHMvZmFjZS5vYmonKTtcclxuICAgIC8vIGNvbnN0IGdlb1Rlc3QgPSBmYWNlLmNoaWxkcmVuWzBdLmdlb21ldHJ5O1xyXG4gICAgLy8gdGhpcy5maWxsUG9zaXRpb25UZXh0dXJlKHRoaXMuZHRQb3NpdGlvbjIsIGdlb1Rlc3QpO1xyXG5cclxuICAgIC8vIEFkZCBvbmx5IG9uZSB2YXJpYWJsZVxyXG4gICAgdGhpcy5wb3NpdGlvblZhcmlhYmxlID0gdGhpcy5ncHVDb21wdXRlLmFkZFZhcmlhYmxlKCdwb3NpdGlvblRleHR1cmUnLCBmcmFnbWVudFNpbXVsYXRpb24yLCB0aGlzLmluaXRUZXh0dXJlKTtcclxuXHJcbiAgICAvLyBBZGQgYm90aCB0ZXh0dXJlcyBhcyB1bmlmb3Jtc1xyXG4gICAgdGhpcy5wb3NpdGlvblZhcmlhYmxlLm1hdGVyaWFsLnVuaWZvcm1zWydwb3NpdGlvblRleHR1cmUxJ10gPSB7dmFsdWU6IHRoaXMuaW5pdFRleHR1cmV9O1xyXG4gICAgdGhpcy5wb3NpdGlvblZhcmlhYmxlLm1hdGVyaWFsLnVuaWZvcm1zWydwb3NpdGlvblRleHR1cmUyJ10gPSB7dmFsdWU6IHRoaXMuaW5pdFRleHR1cmV9O1xyXG5cclxuICAgIC8vIE90aGVyIHVuaWZvcm1zXHJcbiAgICB0aGlzLnBvc2l0aW9uVmFyaWFibGUubWF0ZXJpYWwudW5pZm9ybXNbJ3RpbWUnXSA9IHt2YWx1ZTogMC4wfTtcclxuICAgIHRoaXMucG9zaXRpb25WYXJpYWJsZS5tYXRlcmlhbC51bmlmb3Jtc1snbm9ybWFsaXplZFRpbWUnXSA9IHt2YWx1ZTogMC4wfTtcclxuICAgIHRoaXMucG9zaXRpb25WYXJpYWJsZS5tYXRlcmlhbC51bmlmb3Jtc1sncGFydGljbGVTcGVlZCddID0ge3ZhbHVlOiAxLjB9O1xyXG4gICAgdGhpcy5wb3NpdGlvblZhcmlhYmxlLm1hdGVyaWFsLnVuaWZvcm1zWydmcmVxdWVuY3knXSA9IHt2YWx1ZTogdGhpcy5mcmVxdWVuY3l9O1xyXG4gICAgdGhpcy5wb3NpdGlvblZhcmlhYmxlLm1hdGVyaWFsLnVuaWZvcm1zWydhbXBsaXR1ZGUnXSA9IHt2YWx1ZTogdGhpcy5hbXBsaXR1ZGV9O1xyXG4gICAgdGhpcy5wb3NpdGlvblZhcmlhYmxlLm1hdGVyaWFsLnVuaWZvcm1zWydtYXhEaXN0YW5jZSddID0ge3ZhbHVlOiB0aGlzLm1heERpc3RhbmNlfTtcclxuXHJcbiAgICB0aGlzLmdwdUNvbXB1dGUuaW5pdCgpO1xyXG4gIH1cclxuXHJcbiAgY3JlYXRlVGV4dHVyZShncHVDb21wdXRlOiBHUFVDb21wdXRhdGlvblJlbmRlcmVyLCBnZW9tZXRyeTogQnVmZmVyR2VvbWV0cnkpIHtcclxuICAgIGxldCBkdFBvc2l0aW9uID0gZ3B1Q29tcHV0ZS5jcmVhdGVUZXh0dXJlKCk7XHJcbiAgICB0aGlzLmZpbGxQb3NpdGlvblRleHR1cmUoZHRQb3NpdGlvbiwgZ2VvbWV0cnkpO1xyXG4gICAgZHRQb3NpdGlvbi53cmFwUyA9IFJlcGVhdFdyYXBwaW5nO1xyXG4gICAgZHRQb3NpdGlvbi53cmFwVCA9IFJlcGVhdFdyYXBwaW5nO1xyXG4gICAgcmV0dXJuIGR0UG9zaXRpb247XHJcbiAgfVxyXG5cclxuICB1cGRhdGUodGltZTogbnVtYmVyKSB7XHJcblxyXG4gICAgLy8gdGhpcy5wb3NpdGlvblZhcmlhYmxlLm1hdGVyaWFsLnVuaWZvcm1zWyd0aW1lJ10gPSB7dmFsdWU6IHRpbWV9O1xyXG4gICAgaWYgKCF0aGlzLnBvc2l0aW9uVmFyaWFibGUpIHJldHVybjtcclxuICAgIHRoaXMucG9zaXRpb25WYXJpYWJsZS5tYXRlcmlhbC51bmlmb3Jtc1sndGltZSddLnZhbHVlID0gdGltZTtcclxuICAgIHRoaXMucG9zaXRpb25WYXJpYWJsZS5tYXRlcmlhbC51bmlmb3Jtc1snbm9ybWFsaXplZFRpbWUnXS52YWx1ZSA9IHRoaXMubm9ybWFsaXplZFRpbWU7XHJcbiAgICB0aGlzLnBvc2l0aW9uVmFyaWFibGUubWF0ZXJpYWwudW5pZm9ybXNbJ2ZyZXF1ZW5jeSddLnZhbHVlID0gdGhpcy5mcmVxdWVuY3k7XHJcbiAgICB0aGlzLnBvc2l0aW9uVmFyaWFibGUubWF0ZXJpYWwudW5pZm9ybXNbJ2FtcGxpdHVkZSddLnZhbHVlID0gdGhpcy5hbXBsaXR1ZGU7XHJcblxyXG4gICAgdGhpcy5ncHVDb21wdXRlLmNvbXB1dGUoKTtcclxuICAgIHRoaXMubWF0ZXJpYWwudW5pZm9ybXNbJ3Bvc2l0aW9ucyddLnZhbHVlID0gdGhpcy5ncHVDb21wdXRlLmdldEN1cnJlbnRSZW5kZXJUYXJnZXQodGhpcy5wb3NpdGlvblZhcmlhYmxlKS50ZXh0dXJlO1xyXG4gICAgLy8gdGhpcy5tYXRlcmlhbC51bmlmb3Jtc1sncG9zaXRpb25UZXh0dXJlMiddLnZhbHVlID0gdGhpcy5ncHVDb21wdXRlLmdldEN1cnJlbnRSZW5kZXJUYXJnZXQodGhpcy5wb3NpdGlvblZhcmlhYmxlMikudGV4dHVyZTtcclxuICAgIC8vIHRoaXMubWF0ZXJpYWwudW5pZm9ybXNbJ3RpbWUnXS52YWx1ZSA9IG5vcm1hbGl6ZWRUaW1lO1xyXG4gICAgLy8gY29uc29sZS5sb2cobm9ybWFsaXplZFRpbWUpO1xyXG5cclxuICAgIC8vIHRoaXMucG9zaXRpb25WYXJpYWJsZS5tYXRlcmlhbC51bmlmb3Jtc1snYW1wbGl0dWRlJ10gPSB7dmFsdWU6IHRoaXMuYW1wbGl0dWRlfTtcclxuICAgIC8vIHRoaXMucG9zaXRpb25WYXJpYWJsZS5tYXRlcmlhbC51bmlmb3Jtc1snZnJlcXVlbmN5J10gPSB7dmFsdWU6IHRoaXMuZnJlcXVlbmN5fTtcclxuXHJcblxyXG4gICAgLy8gdGhpcy5tYXRlcmlhbC51bmlmb3Jtc1sndGltZSddLnZhbHVlID0gdGltZTtcclxuICAgIC8vIHRoaXMubWF0ZXJpYWwudW5pZm9ybXNbJ3BhcnRpY2xlU3BlZWQnXS52YWx1ZSA9IDIuMDtcclxuICB9XHJcblxyXG4gIGZpbGxQb3NpdGlvblRleHR1cmUoZHRQb3NpdGlvbjogRGF0YVRleHR1cmUsIGdlb21ldHJ5OiBhbnkpIHtcclxuXHJcbiAgICBsZXQgYXJyID0gZHRQb3NpdGlvbi5pbWFnZS5kYXRhO1xyXG5cclxuICAgIGxldCB2ZXJ0ZXhEYXRhID0gZ2VvbWV0cnkuZ2V0QXR0cmlidXRlKCdwb3NpdGlvbicpLmFycmF5O1xyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSArPSA0KSB7XHJcbiAgICAgIGxldCB2ZXJ0ZXhJbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICh2ZXJ0ZXhEYXRhLmxlbmd0aCAvIDMpKTtcclxuICAgICAgYXJyW2kgKyAwXSA9IHZlcnRleERhdGFbdmVydGV4SW5kZXggKiAzXTsgLy8gTm9ybWFsaXplIHRvIFswLDFdXHJcbiAgICAgIGFycltpICsgMV0gPSB2ZXJ0ZXhEYXRhW3ZlcnRleEluZGV4ICogMyArIDFdOyAvLyBOb3JtYWxpemUgdG8gWzAsMV1cclxuICAgICAgYXJyW2kgKyAyXSA9IHZlcnRleERhdGFbdmVydGV4SW5kZXggKiAzICsgMl07IC8vIE5vcm1hbGl6ZSB0byBbMCwxXVxyXG4gICAgICBhcnJbaSArIDNdID0gMTtcclxuICAgIH1cclxuICAgIGR0UG9zaXRpb24ubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgbG9hZE9iaih1cmw6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XHJcbiAgICBjb25zdCBsb2FkZXIgPSBuZXcgT0JKTG9hZGVyKCk7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICByZXR1cm4gbG9hZGVyLmxvYWQoXHJcbiAgICAgICAgdXJsLFxyXG4gICAgICAgIChyZXMpID0+IHtcclxuICAgICAgICAgIHJlc29sdmUocmVzKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgICh4aHIpID0+IHtcclxuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCh4aHIubG9hZGVkIC8geGhyLnRvdGFsICogMTAwKSArICclIGxvYWRlZCcpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgKGVycm9yKSA9PiB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnQW4gZXJyb3IgaGFwcGVuZWQnKTtcclxuICAgICAgICAgIHJlamVjdCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBtb3J0aCgpIHtcclxuXHJcbiAgICAvLyBtYXhEaXN0YW5jZSA9IDEuOTk7XHJcbiAgICAvLyBmcmVxdWVuY3kgPSAuNTtcclxuICAgIC8vIGFtcGxpdHVkZSA9IDEuNTtcclxuXHJcbiAgICB0aGlzLm5vcm1hbGl6ZWRUaW1lID0gMDtcclxuICAgIGNvbnN0IG9iaiA9IHtcclxuICAgICAgbm9ybWFsaXplZFRpbWU6IDAsXHJcbiAgICAgIGFtcGxpdHVkZTogLjMxLFxyXG4gICAgICBmcmVxdWVuY3k6IC41LFxyXG4gICAgfTtcclxuICAgIGdzYXAudG8ob2JqLCB7XHJcbiAgICAgIG5vcm1hbGl6ZWRUaW1lOiAxLFxyXG4gICAgICBhbXBsaXR1ZGU6IDEuOCxcclxuICAgICAgZnJlcXVlbmN5OiAuMjVcclxuICAgICAgLCBkdXJhdGlvbjogMixcclxuICAgICAgZWFzZTogJ3Bvd2VyMy5pbk91dCcsXHJcbiAgICAgIC8vIHJlcGVhdDogLTEsXHJcbiAgICAgIC8vIHlveW86IHRydWUsXHJcbiAgICAgIG9uUmVwZWF0OiAoKSA9PiB7XHJcbiAgICAgICAgLy8gaWYgKCF0aGlzLnBvc2l0aW9uVmFyaWFibGUpIHJldHVybjtcclxuICAgICAgICAvLyAvLyB0aGlzLmZpbGxQb3NpdGlvblRleHR1cmUodGhpcy5kdFBvc2l0aW9uMSwgbmV3IEljb3NhaGVkcm9uR2VvbWV0cnkoNywgNTApKTtcclxuICAgICAgICAvLyBjb25zdCBzaXplID0gTWF0aC5yYW5kb20oKSAqIDcgKyAzO1xyXG4gICAgICAgIC8vIGNvbnN0IHNlZ21lbnRzID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNTApICsgMTA7XHJcbiAgICAgICAgLy8gdGhpcy5ib3hUZXh0dXJlID0gdGhpcy5jcmVhdGVUZXh0dXJlKHRoaXMuZ3B1Q29tcHV0ZSwgbmV3IEJveEdlb21ldHJ5KHNpemUsIHNpemUsIHNpemUsIHNlZ21lbnRzLCBzZWdtZW50cywgc2VnbWVudHMpKTtcclxuICAgICAgICAvLyB0aGlzLnNwaGVyZVRleHR1cmUgPSB0aGlzLmNyZWF0ZVRleHR1cmUodGhpcy5ncHVDb21wdXRlLCBuZXcgSWNvc2FoZWRyb25HZW9tZXRyeShzaXplLCBzZWdtZW50cykpO1xyXG4gICAgICAgIC8vIGNvbnN0IHRleHR1cmVzID0gW3RoaXMuZmFjZVRleHR1cmUsIHRoaXMuYm94VGV4dHVyZSwgdGhpcy5zcGhlcmVUZXh0dXJlLCB0aGlzLmJveFRleHR1cmUsIHRoaXMuZmFjZVRleHR1cmVdO1xyXG4gICAgICAgIC8vIGNvbnN0IHRleHR1cmUgPSB0ZXh0dXJlc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB0ZXh0dXJlcy5sZW5ndGgpXTtcclxuICAgICAgICAvLyB0aGlzLnBvc2l0aW9uVmFyaWFibGUubWF0ZXJpYWwudW5pZm9ybXNbJ3Bvc2l0aW9uVGV4dHVyZTInXSA9IHt2YWx1ZTogdGV4dHVyZX07XHJcbiAgICAgICAgLy8gdGhpcy5ncHVDb21wdXRlLmluaXQoKTtcclxuICAgICAgfSxcclxuICAgICAgb25VcGRhdGU6ICgpID0+IHtcclxuICAgICAgICB0aGlzLm5vcm1hbGl6ZWRUaW1lID0gb2JqLm5vcm1hbGl6ZWRUaW1lO1xyXG4gICAgICAgIHRoaXMuYW1wbGl0dWRlID0gb2JqLmFtcGxpdHVkZTtcclxuICAgICAgICB0aGlzLmZyZXF1ZW5jeSA9IG9iai5mcmVxdWVuY3k7XHJcbiAgICAgIH0sXHJcbiAgICAgIG9uQ29tcGxldGU6ICgpID0+IHtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uVmFyaWFibGUubWF0ZXJpYWwudW5pZm9ybXNbJ3Bvc2l0aW9uVGV4dHVyZTEnXSA9IHt2YWx1ZTogdGhpcy5jdXJyZW50VGV4dHVyZX07XHJcbiAgICAgICAgLy8gdGhpcy5ncHVDb21wdXRlLmluaXQoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBvblNwaGVyZSgpIHtcclxuICAgIGNvbnN0IHNpemUgPSBNYXRoLnJhbmRvbSgpICogMyArIDY7XHJcbiAgICBjb25zdCBzZWdtZW50cyA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDUwKSArIDEwO1xyXG4gICAgdGhpcy5zcGhlcmVUZXh0dXJlID0gdGhpcy5jcmVhdGVUZXh0dXJlKHRoaXMuZ3B1Q29tcHV0ZSwgbmV3IEljb3NhaGVkcm9uR2VvbWV0cnkoc2l6ZSwgc2VnbWVudHMpKTtcclxuICAgIHRoaXMucG9zaXRpb25WYXJpYWJsZS5tYXRlcmlhbC51bmlmb3Jtc1sncG9zaXRpb25UZXh0dXJlMiddID0ge3ZhbHVlOiB0aGlzLnNwaGVyZVRleHR1cmV9O1xyXG4gICAgdGhpcy5jdXJyZW50VGV4dHVyZSA9IHRoaXMuc3BoZXJlVGV4dHVyZTtcclxuICAgIHRoaXMubW9ydGgoKTtcclxuICB9XHJcblxyXG4gIG9uQ3ViZSgpIHtcclxuICAgIGNvbnN0IHNpemUgPSBNYXRoLnJhbmRvbSgpICogNSArIDEwO1xyXG4gICAgY29uc3Qgc2VnbWVudHMgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA1MCkgKyAxMDtcclxuICAgIHRoaXMuYm94VGV4dHVyZSA9IHRoaXMuY3JlYXRlVGV4dHVyZSh0aGlzLmdwdUNvbXB1dGUsIG5ldyBCb3hHZW9tZXRyeShzaXplLCBzaXplLCBzaXplLCBzZWdtZW50cywgc2VnbWVudHMsIHNlZ21lbnRzKSk7XHJcbiAgICB0aGlzLnBvc2l0aW9uVmFyaWFibGUubWF0ZXJpYWwudW5pZm9ybXNbJ3Bvc2l0aW9uVGV4dHVyZTInXSA9IHt2YWx1ZTogdGhpcy5ib3hUZXh0dXJlfTtcclxuICAgIHRoaXMuY3VycmVudFRleHR1cmUgPSB0aGlzLmJveFRleHR1cmU7XHJcbiAgICB0aGlzLm1vcnRoKCk7XHJcbiAgfVxyXG5cclxuICBvbkZhY2UoKSB7XHJcbiAgICB0aGlzLmZhY2VUZXh0dXJlID0gdGhpcy5jcmVhdGVUZXh0dXJlKHRoaXMuZ3B1Q29tcHV0ZSwgdGhpcy5nZW9GYWNlKTtcclxuICAgIHRoaXMucG9zaXRpb25WYXJpYWJsZS5tYXRlcmlhbC51bmlmb3Jtc1sncG9zaXRpb25UZXh0dXJlMiddID0ge3ZhbHVlOiB0aGlzLmZhY2VUZXh0dXJlfTtcclxuICAgIHRoaXMuY3VycmVudFRleHR1cmUgPSB0aGlzLmZhY2VUZXh0dXJlO1xyXG4gICAgdGhpcy5tb3J0aCgpO1xyXG4gIH1cclxufVxyXG4iXX0=