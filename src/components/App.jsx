import React, { Component } from 'react';
import Controls from './Controls.jsx';
import Tree from './Tree.jsx';


class App extends Component {
  constructor( props ) {
    super( props );
    this.state = {
      open: false,
      maxTrees: 1, // Min 1, Max 20, Step 1, def 1
      maxDepth: 10, // Min 1, Max 22, Step 1, def 10
      frameRate: 20, // Min 1, Max 100, Step 1, def 20
      baseColor: 'rgb(255, 255, 255)',
      angleIncrement: Math.PI / 8,
      randomAngleMax: 1.5, // Min 0, Max 10, step 0.25, def 1.5
      trunkWidth: 10, // Min 0, Max 100, step 1, def 10
      minLengthFactor: 0.5, // Min 0, Max 1, step 0.025, def 0.03
      maxLengthFactor: 0.9, // Min 0, Max 1, step 0.025, def 0.09
      trunkLength: 0, // Min 0, max 1, step 0.025, def 0.1
    };

    this.tree = React.createRef();
    this.onChange = this.onChange.bind( this );
    this.startDrawing = this.startDrawing.bind( this );
  }


  onChange( e, name ) {
    this.setState( {
      [name]: e.target.value,
    } );
  }

  startDrawing() {
    const { open } = this.state;
    this.setState( {
      open: !open,
    } );
    const {
      maxTrees,
      maxDepth,
      frameRate,
      angleIncrement,
      randomAngleMax,
      trunkWidth,
      minLengthFactor,
      maxLengthFactor,
      trunkLength,
    } = this.state;
    this.tree.current.setParams( {
      maxTrees,
      maxDepth,
      frameRate,
      angleIncrement,
      randomAngleMax,
      trunkWidth,
      minLengthFactor,
      maxLengthFactor,
      trunkLength,
    } );
    this.tree.current.start();
  }


  render() {
    const {
      open,
      maxTrees,
      maxDepth,
      frameRate,
      baseColor,
      angleIncrement,
      randomAngleMax,
      trunkWidth,
      minLengthFactor,
      maxLengthFactor,
      trunkLength,
    } = this.state;
    return (
      <div>
        <Controls
          open={open}
          onChange={this.onChange}
          maxTrees={maxTrees}
          maxDepth={maxDepth}
          frameRate={frameRate}
          baseColor={baseColor}
          angleIncrement={angleIncrement}
          randomAngleMax={randomAngleMax}
          trunkWidth={trunkWidth}
          minLengthFactor={minLengthFactor}
          maxLengthFactor={maxLengthFactor}
          trunkLength={trunkLength}
          startDrawing={this.startDrawing}
        />
        <div className="background">
          <Tree
            ref={this.tree}
            baseColor={baseColor}
          />
        </div>
        <button type="button" className="controlButton btn btn-inverse btn-blue" onClick={() => this.setState( { open: !open } )}>Parameters</button>
      </div>
    );
  }
}

export default App;
