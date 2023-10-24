import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RendererService} from './renderer.service';
import {Sketch} from './sketch2';
// import {HelloWorldComponent} from 'face-fbo-lib';
import {FaceFboLibComponent} from '../../projects/face-fbo-lib/src/lib/face-fbo-lib.component';
// import {FaceFboLibModule} from '../../projects/face-fbo-lib/src/lib/face-fbo-lib.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    // HelloWorldComponent
    FaceFboLibComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'template';
  sketch!: Sketch;

  constructor(private renderer: RendererService) {
  }

  ngOnInit(): void {
    // const container = document.getElementById('container');
    // this.renderer.setup(container);
    // this.sketch = new Sketch(this.renderer);
    // this.renderer.sketch = this.sketch;
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
