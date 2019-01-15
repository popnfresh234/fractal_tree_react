import React, { Component } from 'react';
import ColorUtils from './ColorUtils.js';
import NumberUtils from './NumberUtils.js';

class Tree extends Component {
  constructor( props ) {
    super( props );
    this.fractalCanvasRef = React.createRef();
    this.leafCanvasRef = React.createRef();
    this.floor = [];
    this.BASE_COLOR = 'rgb(255, 255, 255)';
    this.dropLeaves = this.dropLeaves.bind( this );
    this.WIDTH = window.innerWidth;
    this.HEIGHT = window.innerHeight;
    this.MARGIN = 200;
    this.MAX_TREES = 1;
    this.MAX_DEPTH = 10;
    this.FRAME_RATE = 7;
    this.branchesFinished = 0;
    this.treesCompleted = 0;
    this.leaves = [];
    this.origin = {
      x: this.WIDTH / 2,
      y: this.HEIGHT,
      length: this.HEIGHT * NumberUtils.randomFactor( 0.1, 0.2 ),
      angle: -Math.PI / 2,
      angleIncrement: Math.PI / 8,
      randomAngleMax: 1.5,
      lineWidth: 10,
      minLengthFactor: 0.05,
      maxLengthFactor: 0.25,
    };
    this.setupCanvases = this.setupCanvases.bind( this );
    this.dropLeaves = this.dropLeaves.bind( this );
    this.drawBranch = this.drawBranch.bind( this );
    this.drawTree = this.drawTree.bind( this );
  }


  componentDidMount() {
    this.fractalCanvas = this.fractalCanvasRef.current;
    this.leafCanvas = this.leafCanvasRef.current;


    this.setupCanvases();
    this.drawTree( ColorUtils.interpolateColors( this.BASE_COLOR, this.MAX_DEPTH ) );
  }

  setupCanvases() {
    this.fractalCtx = this.fractalCanvas.getContext( '2d' );
    this.leafCtx = this.leafCanvas.getContext( '2d' );

    this.leafCanvas.width = window.innerWidth;
    this.leafCanvas.height = window.innerHeight;
    this.leafCtx.canvas.width = this.WIDTH;
    this.leafCtx.canvas.height = this.HEIGHT;

    this.fractalCanvas.width = window.innerWidth;
    this.fractalCanvas.height = window.innerHeight;
    this.fractalCtx.canvas.width = this.WIDTH;
    this.fractalCtx.canvas.height = this.HEIGHT;
  }


  dropLeaves() {
    let animationId = 0;
    let usedLeaves = [];
    this.leafCtx.clearRect( 0, 0, this.WIDTH, this.HEIGHT );
    while ( this.leaves.length ) {
      const leaf = this.leaves.splice( NumberUtils.randomInt( this.leaves.length ), 1 )[0];
      const stickyTest = NumberUtils.randomFactor( 0, 100 );
      if ( stickyTest < leaf.stickyThreshold ) {
        leaf.dropped = true;
      }

      if ( leaf.dropped && !leaf.isDown ) {
        leaf.y += NumberUtils.randomFactor( 0, 1 );
        leaf.x += NumberUtils.randomFactor( -2, 2.5 );
      }
      // add leaf to used leaves
      if ( leaf.y < this.HEIGHT ) {
        usedLeaves.push( leaf );
      } else {
        leaf.x = Math.floor( leaf.x );
        leaf.y = this.HEIGHT - 2;
        if ( leaf.x % 2 ) {
          leaf.x += 1;
        }
        leaf.isDown = true;
        if ( !this.floor[leaf.x] ) {
          this.floor[leaf.x] = leaf.x;
          usedLeaves.push( leaf );
        }
      }
      // draw Leaf
      this.leafCtx.beginPath();
      this.leafCtx.fillStyle = leaf.color;
      this.leafCtx.moveTo( leaf.x, leaf.y );
      this.leafCtx.fillRect( Math.floor( leaf.x ), Math.floor( leaf.y ), 2, 2 );
      this.leafCtx.lineWidth = 1;
      this.leafCtx.stroke();
    }
    // Reset arrays
    this.leaves = usedLeaves;
    usedLeaves = [];

    if ( this.leaves.filter( leaf => leaf.y < this.HEIGHT - 2 ) ) {
      animationId = requestAnimationFrame( this.dropLeaves );
    } else {
      cancelAnimationFrame( animationId );
    }
  }

  drawBranch( x, y, a, l, strokeWidth, count, colors ) {
    let frameCount = 1;
    let waypoints = [];

    function drawLine( callback, ctx ) {
      function animateLine() {
        ctx.fractalCtx.beginPath();
        ctx.fractalCtx.moveTo( waypoints[frameCount - 1].x, waypoints[frameCount - 1].y );
        ctx.fractalCtx.lineTo( waypoints[frameCount].x, waypoints[frameCount].y );
        ctx.fractalCtx.strokeStyle = colors.trunkColors[count];
        ctx.fractalCtx.lineWidth = strokeWidth;
        ctx.fractalCtx.stroke();
        ctx.fractalCtx.closePath();
        frameCount += 1;
        if ( frameCount < waypoints.length - 1 ) {
          requestAnimationFrame( animateLine );
        } else {
          callback();
        }
      }
      animateLine();
    }

    if ( count <= this.MAX_DEPTH ) {
      const newCount = count + 1;
      const newX = x + Math.cos( a ) * l;
      const newY = y + Math.sin( a ) * l;

      waypoints = NumberUtils.buildWaypoints( x, y, newX, newY, this.FRAME_RATE );
      drawLine( () => {
        this.drawBranch(
          newX, newY,
          a - this.origin.angleIncrement * NumberUtils.randomFactor( 1, this.origin.randomAngleMax ),
          l * NumberUtils.randomFactor( 0.5, 0.9 ),
          strokeWidth * 0.7,
          newCount,
          colors,
        );
        this.drawBranch(
          newX, newY,
          a + this.origin.angleIncrement * NumberUtils.randomFactor( 1, this.origin.randomAngleMax ),
          l * NumberUtils.randomFactor( 0.5, 0.9 ),
          strokeWidth * 0.7,
          newCount,
          colors,
        );
      }, this );
      if ( count === this.MAX_DEPTH ) {
        this.leafCtx.beginPath();
        this.leaves.push( {
          x: newX,
          y: newY,
          color: colors.treeColor,
          stickyThreshold: NumberUtils.randomFactor( 0, 1 ),
          dropped: false,
        } );
        this.leafCtx.fillStyle = colors.treeColor;
        this.leafCtx.fillRect( newX, newY, 2, 2 );
        this.leafCtx.lineWidth = 1;
        this.leafCtx.stroke();
      }
    } else {
      this.branchesFinished += 1;


      // Check and see if all branches have been drawn, if so draw next tree
      if ( this.branchesFinished === 2 ** ( this.MAX_DEPTH + 1 ) ) {
        this.branchesFinished = 0;
        this.treesCompleted += 1;
        if ( this.treesCompleted < this.MAX_TREES ) {
          this.drawTree( ColorUtils.interpolateColors( this.BASE_COLOR, this.MAX_DEPTH ) );
        } else {
          this.dropLeaves();
        }
      }
    }
  }


  drawTree( colors ) {
    this.drawBranch(
      NumberUtils.randomFactor( this.MARGIN, this.WIDTH - this.MARGIN ),
      this.origin.y,
      this.origin.angle,
      this.HEIGHT * NumberUtils.randomFactor( this.origin.minLengthFactor, this.origin.maxLengthFactor ),
      NumberUtils.randomFactor( 1, this.origin.lineWidth ),
      0,
      colors,
    );
  }


  render() {
    return (
      <div>
        <canvas className="fractal_canvas" ref={this.fractalCanvasRef} />
        <canvas className="leaf_canvas" ref={this.leafCanvasRef} />
      </div>
    );
  }
}
export default Tree;