import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { RGBAFormat } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import * as i0 from "@angular/core";
class RendererService {
    constructor() {
        this.clock = new THREE.Clock();
        this.width = 0;
        this.height = 0;
        this.angle = 0;
        this.render = () => {
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
        };
        console.log('RendererService');
    }
    setup(container) {
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
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: RGBAFormat,
            type: THREE.FloatType,
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
        const afterimagePass = new AfterimagePass();
        afterimagePass.uniforms['damp'].value = .9;
        const fxaaPass = new ShaderPass(FXAAShader);
        const pixelRatio = this.renderer.getPixelRatio();
        fxaaPass.material.uniforms['resolution'].value.x = 1 / (this.container.offsetWidth * pixelRatio);
        fxaaPass.material.uniforms['resolution'].value.y = 1 / (this.container.offsetHeight * pixelRatio);
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), .5, .01, .95);
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
    createCamera() {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.1.4", ngImport: i0, type: RendererService, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "16.1.4", ngImport: i0, type: RendererService, providedIn: 'root' }); }
}
export { RendererService };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.1.4", ngImport: i0, type: RendererService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: function () { return []; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJlbmRlcmVyLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMvQixPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sT0FBTyxDQUFDO0FBQ2pDLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSwyQ0FBMkMsQ0FBQztBQUN4RSxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sa0RBQWtELENBQUM7QUFDaEYsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLGtEQUFrRCxDQUFDO0FBQ2hGLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSw4Q0FBOEMsQ0FBQztBQUN4RSxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sdUNBQXVDLENBQUM7QUFDakUsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLG1EQUFtRCxDQUFDO0FBQ2xGLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSw2Q0FBNkMsQ0FBQztBQUN0RSxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sOENBQThDLENBQUM7O0FBR3hFLE1BR2EsZUFBZTtJQWExQjtRQVZBLFVBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMxQixVQUFLLEdBQVcsQ0FBQyxDQUFDO1FBQ2xCLFdBQU0sR0FBVyxDQUFDLENBQUM7UUFNbkIsVUFBSyxHQUFXLENBQUMsQ0FBQztRQW9IbEIsV0FBTSxHQUFHLEdBQUcsRUFBRTtZQUNaLHFCQUFxQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNuQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBRXpDLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUU7Z0JBQzFCLElBQUks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QUFDO1FBQ2xDLDRCQUE0QjtRQUU1QixRQUFRLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsaUNBQWlDO1FBQ3ZFLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFFdEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFxQkQsWUFBWTtRQUNWLE1BQU0sTUFBTSxHQUFHLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2xHLE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxNQUFNO1FBQ0osSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQztRQUN4QyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDO1FBQzFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUM5QyxJQUFJLENBQUMsTUFBTSxDQUFDLHNCQUFzQixFQUFFLENBQUM7UUFDckMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDakQsQ0FBQzs4R0E3SlUsZUFBZTtrSEFBZixlQUFlLGNBRmQsTUFBTTs7U0FFUCxlQUFlOzJGQUFmLGVBQWU7a0JBSDNCLFVBQVU7bUJBQUM7b0JBQ1YsVUFBVSxFQUFFLE1BQU07aUJBQ25CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCAqIGFzIFRIUkVFIGZyb20gJ3RocmVlJztcbmltcG9ydCB7UkdCQUZvcm1hdH0gZnJvbSAndGhyZWUnO1xuaW1wb3J0IHtPcmJpdENvbnRyb2xzfSBmcm9tICd0aHJlZS9leGFtcGxlcy9qc20vY29udHJvbHMvT3JiaXRDb250cm9scyc7XG5pbXBvcnQge0VmZmVjdENvbXBvc2VyfSBmcm9tICd0aHJlZS9leGFtcGxlcy9qc20vcG9zdHByb2Nlc3NpbmcvRWZmZWN0Q29tcG9zZXInO1xuaW1wb3J0IHtBZnRlcmltYWdlUGFzc30gZnJvbSAndGhyZWUvZXhhbXBsZXMvanNtL3Bvc3Rwcm9jZXNzaW5nL0FmdGVyaW1hZ2VQYXNzJztcbmltcG9ydCB7U2hhZGVyUGFzc30gZnJvbSAndGhyZWUvZXhhbXBsZXMvanNtL3Bvc3Rwcm9jZXNzaW5nL1NoYWRlclBhc3MnO1xuaW1wb3J0IHtGWEFBU2hhZGVyfSBmcm9tICd0aHJlZS9leGFtcGxlcy9qc20vc2hhZGVycy9GWEFBU2hhZGVyJztcbmltcG9ydCB7VW5yZWFsQmxvb21QYXNzfSBmcm9tICd0aHJlZS9leGFtcGxlcy9qc20vcG9zdHByb2Nlc3NpbmcvVW5yZWFsQmxvb21QYXNzJztcbmltcG9ydCB7Qm9rZWhQYXNzfSBmcm9tICd0aHJlZS9leGFtcGxlcy9qc20vcG9zdHByb2Nlc3NpbmcvQm9rZWhQYXNzJztcbmltcG9ydCB7UmVuZGVyUGFzc30gZnJvbSAndGhyZWUvZXhhbXBsZXMvanNtL3Bvc3Rwcm9jZXNzaW5nL1JlbmRlclBhc3MnO1xuXG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnXG59KVxuZXhwb3J0IGNsYXNzIFJlbmRlcmVyU2VydmljZSB7XG4gIHNjZW5lOiBhbnlcbiAgY2FtZXJhOiBhbnk7XG4gIGNsb2NrID0gbmV3IFRIUkVFLkNsb2NrKCk7XG4gIHdpZHRoOiBudW1iZXIgPSAwO1xuICBoZWlnaHQ6IG51bWJlciA9IDA7XG4gIGNvbnRyb2xzOiBhbnk7XG4gIHJlbmRlcmVyOiBhbnk7XG4gIGNvbXBvc2VyOiBhbnk7XG4gIGNvbnRhaW5lcjogYW55XG4gIHNrZXRjaCE6IGFueTtcbiAgYW5nbGU6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgY29uc29sZS5sb2coJ1JlbmRlcmVyU2VydmljZScpO1xuICB9XG5cblxuICBzZXR1cChjb250YWluZXI6IGFueSkge1xuICAgIHRoaXMuY29udGFpbmVyID0gY29udGFpbmVyO1xuICAgIC8vIENyZWF0ZSB0aGUgc2NlbmUgYW5kIGNhbWVyYVxuICAgIHRoaXMuc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcbiAgICB0aGlzLmNhbWVyYSA9IHRoaXMuY3JlYXRlQ2FtZXJhKCk7XG4gICAgdGhpcy5jYW1lcmEucG9zaXRpb24ueiA9IDE1O1xuICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnkgPSAwO1xuICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnggPSAwO1xuXG4gICAgLy8gdGhpcy5zY2VuZS5mb2cgPSBuZXcgVEhSRUUuRm9nKDB4MDAwMDAwLCAxMCwgNDApO1xuICAgIC8vIHRoaXMuc2NlbmUuYmFja2dyb3VuZCA9IG5ldyBUSFJFRS5Db2xvcigweDAwMDAwMCk7XG5cblxuICAgIC8vIGNvbnN0IGF4ZXNIZWxwZXIgPSBuZXcgVEhSRUUuQXhlc0hlbHBlcig1KTtcbiAgICAvLyB0aGlzLnNjZW5lLmFkZChheGVzSGVscGVyKTtcbiAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgbWluRmlsdGVyOiBUSFJFRS5OZWFyZXN0RmlsdGVyLC8vaW1wb3J0YW50IGFzIHdlIHdhbnQgdG8gc2FtcGxlIHNxdWFyZSBwaXhlbHNcbiAgICAgIG1hZ0ZpbHRlcjogVEhSRUUuTmVhcmVzdEZpbHRlciwvL1xuICAgICAgZm9ybWF0OiBSR0JBRm9ybWF0LC8vY291bGQgYmUgUkdCQUZvcm1hdFxuICAgICAgdHlwZTogVEhSRUUuRmxvYXRUeXBlLCAvL2ltcG9ydGFudCBhcyB3ZSBuZWVkIHByZWNpc2UgY29vcmRpbmF0ZXMgKG5vdCBpbnRzKVxuICAgICAgYW50aWFsaWFzOiB0cnVlXG4gICAgfTtcbiAgICB0aGlzLnJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoKTtcbiAgICB0aGlzLnJlbmRlcmVyLnNldENsZWFyQ29sb3IoMHgwMDAwMDAsIDApOyAvLyBTZXQgYSB0cmFuc3BhcmVudCBiYWNrZ3JvdW5kXG4gICAgdGhpcy5yZW5kZXJlci5hbHBoYSA9IHRydWU7XG4gICAgdGhpcy5yZW5kZXJlci5zb3J0T2JqZWN0cyA9IGZhbHNlO1xuXG4gICAgdGhpcy53aWR0aCA9IHRoaXMuY29udGFpbmVyLm9mZnNldFdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5jb250YWluZXIub2Zmc2V0SGVpZ2h0O1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U2l6ZSh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgdGhpcy5yZW5kZXJlci5zaGFkb3dNYXAuZW5hYmxlZCA9IHRydWU7XG4gICAgdGhpcy5yZW5kZXJlci5zaGFkb3dNYXAuYXV0b1VwZGF0ZSA9IHRydWU7XG5cbiAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQpO1xuICAgIC8vIHRoaXMuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vbkNvbnRhaW5lckNsaWNrKTtcbiAgICB0aGlzLmNvbnRyb2xzID0gbmV3IE9yYml0Q29udHJvbHModGhpcy5jYW1lcmEsIHRoaXMucmVuZGVyZXIuZG9tRWxlbWVudCk7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5yZXNpemUuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmFkanVzdExpZ2h0aW5nKCk7XG5cbiAgICAvLyB0aGlzLnZpc09icyA9IG5ldyBWaXNPYnModmlzT2JzQ3R4KTtcbiAgICAvLyB0aGlzLnRyYWNrc0NvbnRyb2xsZXIgPSBuZXcgVHJhY2tzQ29udHJvbGxlcih0aGlzLCB0aGlzLnZpc09icyk7XG4gICAgdGhpcy5pbml0Q29tcG9zZXIoKTtcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgaW5pdENvbXBvc2VyKCkge1xuXG4gICAgLy8gY29uc3QgcmVuZGVyU2NlbmUgPSBuZXcgUmVuZGVyUGFzcyh0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSk7XG4gICAgdGhpcy5jb21wb3NlciA9IG5ldyBFZmZlY3RDb21wb3Nlcih0aGlzLnJlbmRlcmVyKTtcblxuICAgIGNvbnN0IGFmdGVyaW1hZ2VQYXNzOiBhbnkgPSBuZXcgQWZ0ZXJpbWFnZVBhc3MoKTtcbiAgICBhZnRlcmltYWdlUGFzcy51bmlmb3Jtc1snZGFtcCddLnZhbHVlID0gLjk7XG5cbiAgICBjb25zdCBmeGFhUGFzcyA9IG5ldyBTaGFkZXJQYXNzKEZYQUFTaGFkZXIpO1xuICAgIGNvbnN0IHBpeGVsUmF0aW8gPSB0aGlzLnJlbmRlcmVyLmdldFBpeGVsUmF0aW8oKTtcblxuICAgIGZ4YWFQYXNzLm1hdGVyaWFsLnVuaWZvcm1zWydyZXNvbHV0aW9uJ10udmFsdWUueCA9IDEgLyAodGhpcy5jb250YWluZXIub2Zmc2V0V2lkdGggKiBwaXhlbFJhdGlvKTtcbiAgICBmeGFhUGFzcy5tYXRlcmlhbC51bmlmb3Jtc1sncmVzb2x1dGlvbiddLnZhbHVlLnkgPSAxIC8gKHRoaXMuY29udGFpbmVyLm9mZnNldEhlaWdodCAqIHBpeGVsUmF0aW8pO1xuXG4gICAgY29uc3QgYmxvb21QYXNzID0gbmV3IFVucmVhbEJsb29tUGFzcyhuZXcgVEhSRUUuVmVjdG9yMih3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KSxcbiAgICAgIC41LCAuMDEsIC45NSk7XG5cbiAgICBjb25zdCBib2tlaFBhc3MgPSBuZXcgQm9rZWhQYXNzKHRoaXMuc2NlbmUsIHRoaXMuY2FtZXJhLCB7XG4gICAgICBmb2N1czogMTAsXG4gICAgICBhcGVydHVyZTogMC4wMDEsXG4gICAgICBtYXhibHVyOiAwLjAwMSxcbiAgICB9KTtcbiAgICBib2tlaFBhc3MubmVlZHNTd2FwID0gdHJ1ZTtcbiAgICBib2tlaFBhc3MucmVuZGVyVG9TY3JlZW4gPSB0cnVlO1xuXG5cbiAgICBjb25zdCByZW5kZXJQYXNzID0gbmV3IFJlbmRlclBhc3ModGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEpO1xuICAgIC8vIHJlbmRlclBhc3MuY2xlYXIgPSBmYWxzZTtcbiAgICAvLyByZW5kZXJQYXNzLmNsZWFyRGVwdGggPSB0cnVlO1xuICAgIHRoaXMuY29tcG9zZXIuYWRkUGFzcyhyZW5kZXJQYXNzKTtcbiAgICAvLyB0aGlzLmNvbXBvc2VyLmFkZFBhc3MoYWZ0ZXJpbWFnZVBhc3MpO1xuICAgIC8vIHRoaXMuY29tcG9zZXIuYWRkUGFzcyhmeGFhUGFzcyk7XG4gICAgLy8gdGhpcy5jb21wb3Nlci5hZGRQYXNzKGJsb29tUGFzcyk7XG4gICAgLy8gdGhpcy5jb21wb3Nlci5hZGRQYXNzKGJva2VoUGFzcyk7XG5cbiAgfVxuXG4gIGFkanVzdExpZ2h0aW5nKCkge1xuXG4gICAgY29uc3QgaGVtaUxpZ2h0ID0gbmV3IFRIUkVFLkhlbWlzcGhlcmVMaWdodCgweGZmZmZmZiwgMHhmZmZmZmYpO1xuICAgIGhlbWlMaWdodC5wb3NpdGlvbi5zZXQoMCwgMzAsIDApO1xuXG4gICAgY29uc3QgZGlyTGlnaHQgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweGZmZmZmZik7XG4gICAgZGlyTGlnaHQucG9zaXRpb24uc2V0KDAsIDMwLCAwKTtcbiAgICBkaXJMaWdodC5jYXN0U2hhZG93ID0gdHJ1ZTtcbiAgICBjb25zdCBmcnVzdHVtU2l6ZSA9IDEwMDsgLy8gQWRqdXN0IHRoaXMgdmFsdWUgYWNjb3JkaW5nIHRvIHlvdXIgc2NlbmUncyBzY2FsZVxuXG4gICAgZGlyTGlnaHQuc2hhZG93LmNhbWVyYS50b3AgPSBmcnVzdHVtU2l6ZTtcbiAgICBkaXJMaWdodC5zaGFkb3cuY2FtZXJhLmJvdHRvbSA9IC1mcnVzdHVtU2l6ZTtcbiAgICBkaXJMaWdodC5zaGFkb3cuY2FtZXJhLmxlZnQgPSAtZnJ1c3R1bVNpemU7XG4gICAgZGlyTGlnaHQuc2hhZG93LmNhbWVyYS5yaWdodCA9IGZydXN0dW1TaXplO1xuXG4gICAgZGlyTGlnaHQuc2hhZG93LmNhbWVyYS5uZWFyID0gMC4xO1xuICAgIGRpckxpZ2h0LnNoYWRvdy5jYW1lcmEuZmFyID0gMTAwMDtcbiAgICAvLyBkaXJMaWdodC5zaGFkb3cuYmlhcyA9IDA7XG5cbiAgICBkaXJMaWdodC5zaGFkb3cubWFwU2l6ZS53aWR0aCA9IDEwMjQ7IC8vIEFkanVzdCBhY2NvcmRpbmcgdG8geW91ciBuZWVkc1xuICAgIGRpckxpZ2h0LnNoYWRvdy5tYXBTaXplLmhlaWdodCA9IDEwMjQ7XG5cbiAgICB0aGlzLnNjZW5lLmFkZChoZW1pTGlnaHQsIGRpckxpZ2h0KTtcbiAgfVxuXG4gIHJlbmRlciA9ICgpID0+IHtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5yZW5kZXIpO1xuICAgIGNvbnN0IHRpbWUgPSB0aGlzLmNsb2NrLmdldEVsYXBzZWRUaW1lKCk7XG5cbiAgICBpZiAodGhpcy5za2V0Y2g/LmlzUnVubmluZykge1xuICAgICAgdGhpcy5za2V0Y2gudXBkYXRlKHRpbWUpO1xuICAgICAgLy8gdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEpO1xuICAgICAgdGhpcy5jb21wb3Nlci5yZW5kZXIoKTtcblxuICAgICAgLy8gdGhpcy5jYW1lcmEucG9zaXRpb24ueCA9IDE2LjUgKiBNYXRoLmNvcyh0aGlzLmFuZ2xlKTtcbiAgICAgIC8vIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnogPSAxNi41ICogTWF0aC5zaW4odGhpcy5hbmdsZSk7XG4gICAgICAvLyB0aGlzLmNhbWVyYS5sb29rQXQobmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMCkpO1xuXG4gICAgICAvLyBJbmNyZWFzZSB0aGUgYW5nbGUgZm9yIHRoZSBuZXh0IGZyYW1lXG4gICAgICB0aGlzLmFuZ2xlICs9IDAuMDAxO1xuXG4gICAgfVxuICB9XG5cbiAgY3JlYXRlQ2FtZXJhKCk6IGFueSB7XG4gICAgY29uc3QgY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDc1LCB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodCwgMC4xLCAxMDAwKTtcbiAgICByZXR1cm4gY2FtZXJhO1xuICB9XG5cbiAgcmVzaXplKCkge1xuICAgIHRoaXMud2lkdGggPSB0aGlzLmNvbnRhaW5lci5vZmZzZXRXaWR0aDtcbiAgICB0aGlzLmhlaWdodCA9IHRoaXMuY29udGFpbmVyLm9mZnNldEhlaWdodDtcbiAgICB0aGlzLmNhbWVyYS5hc3BlY3QgPSB0aGlzLndpZHRoIC8gdGhpcy5oZWlnaHQ7XG4gICAgdGhpcy5jYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U2l6ZSh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gIH1cbn1cbiJdfQ==