import * as THREE from 'three';
import * as i0 from "@angular/core";
export declare class RendererService {
    scene: any;
    camera: any;
    clock: THREE.Clock;
    width: number;
    height: number;
    controls: any;
    renderer: any;
    composer: any;
    container: any;
    sketch: any;
    angle: number;
    constructor();
    setup(container: any): void;
    initComposer(): void;
    adjustLighting(): void;
    render: () => void;
    createCamera(): any;
    resize(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<RendererService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<RendererService>;
}
