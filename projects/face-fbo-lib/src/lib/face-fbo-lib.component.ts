import {Component} from '@angular/core';
import {Sketch} from '../../../../src/app/sketch2';
import {RendererService} from '../../../../src/app/renderer.service';

@Component({
  selector: 'lib-face-fbo-lib',
  templateUrl: './face-fbo-lib.component.html',
  styleUrls: ['./face-fbo-lib.component.scss']
})
export class FaceFboLibComponent {
  title = 'template';
  sketch!: Sketch;

  constructor(private renderer: RendererService) {
  }

  ngOnInit(): void {
    const container = document.getElementById('container');
    this.renderer.setup(container);
    this.sketch = new Sketch(this.renderer);
    this.renderer.sketch = this.sketch;
    console.log('OK');
  }


  onSphere() {
    // this.sketch.onSphere();
  }

  onCube() {
    // this.sketch.onCube();
  }

  onFace() {
    // this.sketch.onFace();
  }
}
