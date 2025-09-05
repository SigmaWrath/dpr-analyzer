import { useState, useEffect, useRef } from 'react'
import { Input, Space, Switch, ConfigProvider, theme, Button, Card, Flex,
            Tooltip, Typography, ColorPicker, Checkbox, Col, Row, Select} from "antd";
import { CheckOutlined, DeleteOutlined, EditOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import './App.css'
const {Title, Text} = Typography
import axios from 'axios';
import 'react-plotly.js'

/*<ConfigProvider
      theme={{
        components: {
          Button: {
            colorPrimary: "#018689ff",       // switch "on" color
            colorPrimaryHover: "#07a7aaff", // hover color
            colorPrimaryActive: "#03c2c5ff", // active (pressed) state
            colorPrimaryBorder: "#07edf0ff"
          },
        },
      }}
    >
    </ConfigProvider>*/

/* TODO: 
*   1. PHASE 7: UI Polishing
        Make graph positioning robust to browser.

        Two-line titles shouldn't push out bottom bar

        Say you can't use on phone

        Fonts for graphs. Also density of ticks for higher damage. Labels get too close to number when # of digits increases.
          Probabilities in %?

    4. PHASE 8: Add remaining formula features to python dpr_core
          Final new features before wrap-up:
            1. Elven accuracy
            2. Crit/fail
            3. Number of rounds in Analyzer, so it can averaged over a few rounds of combat
    5. PHASE 9: Convert dpr_core into JS (https://www.gitloop.com/tool/python-to-javascript)
          Before starting, touch up the python code to make sure it's well architected and streamlined.
          Push to git, then clone into a new branch.
          SETUP A TESTING ENVIRONMENT FOR THE LOVE OF GOD... actually just test in the tool?
          Go file by file:
            1. Die.py                 [avg, distribution]
            2. probability_utils.py   [add_dists, halve_dist, superposition_dists]
            3. DiceFormula.py         [avg_roll, frequencies]
            4. Attack.py              [prob_to_hit, damage_dist, damage_avg]
            5. Analyzer.py            [add, simulate, get_avg]
    6. PHASE 10: Saving configurations
        Cogito -> S3. Get IAM right
    7. PHASE 11: Tours, help, documentation, credits
    8. PHASE 12: Deployment
*/

/* Future iterations:
      1. Advanced color customization, accessible through floating button (open up drawer? or modal)
      2. Formulas like A2d6 (for savage attacks) -- which is different from 2Ad6 (which we should also facilitate)
      3. Champion crits, like d20c10%
      4. Reroll on x numbers, like d20r1
      5. Great weapon fighting -type things, like 2d6f3 ("f" for "floor")
      6. Brainstorm: a way to analyze 1/round things. Find total chance of hit per round??
          Maybe instead of num rounds, fractional attacks, using smth similar to halve_dist().
          Then we could do a special rider type that is referentially added to other attacks?

      More advanced formulas can be enabled with an "order of operations" for the effects
*/

// Perfectionism:
// 1. Make tooltip for invalid dice formula show up immediately without having to hover away and back. 
//      Hint: I already tried getting rid of the ternary and using a state for that, so that's not it.

// Ask for Opinions:
//    1. Confine AnalyzerConfiguration to the bottom of the page ??
//    2. Confirmation Modal for removing attack cards?
//    3. Perhaps: an ability to let you zoom into the graphs, or temporarily make them full screen.

// Idea: Ability to save config from website as a JSON file? And then reupload later. 
// UI would be a float button that opens up a drawer for this.

function SaveSwitch({
  switchState, 
  onSwitchStateChange, 
}) {

  const toggle = () => {
    onSwitchStateChange(!switchState)
  }

  return (
    <ConfigProvider
      theme={{
        components: {
          Switch: {
            colorPrimary: "#018689ff",       // switch "on" color
            colorPrimaryHover: "#07a7aaff", // hover color
          },
        },
      }}
    >
      <Switch 
        checked={switchState}
        onChange={ toggle } 
        checkedChildren="Saving Throw" 
        unCheckedChildren="Attack Roll" />
    </ConfigProvider>
  )
}

function AttackButton({
  attackName,
  damageValue,
  attackValue,
  saveType,
  numValue,
  switchState,
  damageError,
  toHitError,
  dprAttacks,
  onDprChange
}) {

  const [submitDisabled, setSubmitDisabled] = useState(false)

  // Update submitDisabled state if any of the text fields are empty
  useEffect( () => {
    if ( attackName=="" || damageValue=="" || (attackValue=="" && !switchState) || numValue=="" ) {
      setSubmitDisabled(true)
    }
    else {
      setSubmitDisabled(false)
    }
  }, [attackName, damageValue, attackValue, switchState, numValue])

  const addAttack = () => {
    var isUnique = true;

    dprAttacks.forEach(attack => {
      if (attack.name==attackName.trim() && attack.damagef==damageValue.replace(/[\s\u00A0\u200B-\u200D\uFEFF]/g, '')
        && ((attack.hitf==attackValue.replace(/[\s\u00A0\u200B-\u200D\uFEFF]/g, '') && !switchState) || 
              ((attack.hitf==saveType) && switchState)) ) {
        isUnique = false;
        onDprChange(
          dprAttacks.map(item =>
            item.name == attack.name 
            ? { ...item, times: Number(item.times) + Number(numValue) }
            : item
          )
        )
      }
      else if (attack.name==attackName.trim()) {
        isUnique=false;
        // Attacks with different properties must have unique names
      }
      else {}
    })

    if (isUnique && damageError=='' && toHitError=='') {
      if (switchState) {
        onDprChange(
          [
            {
              name: attackName.trim(),
              damagef: damageValue.replace(/[\s\u00A0\u200B-\u200D\uFEFF]/g, ''),
              hitf: saveType,
              times: numValue
            },
            ...dprAttacks 
          ]
        )
      }
      else {
        onDprChange(
          [
            {
              name: attackName.trim(),
              damagef: damageValue.replace(/[\s\u00A0\u200B-\u200D\uFEFF]/g, ''),
              hitf: attackValue.replace(/[\s\u00A0\u200B-\u200D\uFEFF]/g, ''),
              times: numValue
            },
            ...dprAttacks 
          ]
        )
      }
    }
    
  }

  return (
    <Button disabled={submitDisabled} style={{ marginTop: 6}} type='primary' onClick={addAttack}>+ Add Attack</Button>
  )
}

function ClearButton({
  onAttackNameChange,
  onDamgeValueChange,
  onAttackValueChange,
  setSaveOption,
  onNumValueChange,
  onSwitchStateChange
}) {
  const clearText = () => {
    onAttackNameChange("")
    onDamgeValueChange("")
    onAttackValueChange("")
    setSaveOption("SAVE")
    onNumValueChange("")
    onSwitchStateChange(false)
  }

  return (
    <Button 
      color='blue' 
      variant='filled'
      onClick={clearText}
      style={{ marginTop: 6, paddingLeft: 25, paddingRight: 25}}
    >
      Clear Input
    </Button>
  )

}

function AttackInput({ 
  attackName,
  damageValue,
  attackValue,
  saveOption,
  numValue,
  switchState,
  dprAttacks, 
  setAttackName,
  setDamageValue,
  setAttackValue,
  setSaveOption,
  setNumValue,
  setSwitchState,
  onDprChange 
}) {

  const [saveType, setSaveType] = useState('SAVE')

  const [nameError, setNameError] = useState('')
  const [damageError, setDamageError] = useState('')
  const [toHitError, setToHitError] = useState('')

  // Update nameError state if input has: same name + different properties
  // Also: Update damageError and toHitError if their input isn't a valid DiceFormula
  useEffect( () => {
    // nameError
    var isError = false;
    dprAttacks.forEach( attack => {
      if ( attack.name==attackName.trim() && !( attack.damagef==damageValue.replace(/[\s\u00A0\u200B-\u200D\uFEFF]/g, '')
            && ((attack.hitf==attackValue.replace(/[\s\u00A0\u200B-\u200D\uFEFF]/g, '') && !switchState) || 
                ((attack.hitf==saveType) && switchState)) ) ) {
        setNameError('error')
        isError = true
      }
    })
    if (!isError) {
      setNameError('')
    }

    // damageError
    if (!checkFormulaPattern(damageValue.replace(/[\u00A0\u200B-\u200D\uFEFF]/g, '').trim())) {
      setDamageError('error')
    } else {
      setDamageError('')
    }

    // toHitError
    if (!checkFormulaPattern(attackValue.replace(/[\u00A0\u200B-\u200D\uFEFF]/g, '').trim())) {
      setToHitError('error')
    } else {
      setToHitError('')
    }

  }, [damageValue, attackValue, saveType, attackName, switchState, dprAttacks])

  // Function to check a whether a string is a valid DiceFormula
  const checkFormulaPattern = (pattern) => {
    var isFormula = true

    const soleDie = /^d\d+$/
    const diceRoll = /^\d+d\d+$/
    const advDiceRoll = /^Ad\d+$/
    const dadvDiceRoll = /^Dd\d+$/
    const modifier = /^\d+$/
    const validTerms = [soleDie, diceRoll, advDiceRoll, dadvDiceRoll, modifier]

    const pieces = pattern.split("+")

    pieces.forEach( piece => {
      var isPieceValid = false
      validTerms.forEach( term => {
        if (term.test(piece.trim())) {
          isPieceValid = true
        }
      })
      if (piece=="") {
        isPieceValid = true
      }
      if (!isPieceValid) {
        isFormula = false
      }
    })

    if (pattern.includes("++") || pattern.at(0)=="+" || pattern.at(-1)=="+") {
      return false;
    }
    
    if (isFormula || pattern=="") {
      return true
    } 
    return false
  }

  return (
    <div className="attack-input">
      <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
        <Space direction="vertical" size="small">
          <Tooltip 
            placement='top'
            title={ nameError 
              ? <div style={{ textAlign: "center" }}>Attack name already in use</div> 
              : null
            }
          >
              <Input 
                style={{ width : "28vw" }} 
                placeholder="Attack name"
                value={attackName}
                status={nameError}
                onChange={ (e)=> setAttackName(e.target.value) }
              />
          </Tooltip>
          <Tooltip 
            placement='top'
            title={ damageError 
              ? <div style={{ textAlign: "center" }}>Invalid dice formula</div> 
              : null
            }
          >
            <Input 
              style={{ width : "28vw" }} 
              placeholder="Damage formula"
              value={damageValue}
              status={damageError}
              onChange={ (e)=> setDamageValue(e.target.value/*.replace(/[^dDA+0-9 ]/g, "")*/)}
            />
          </Tooltip>
          <Space style={{ display: 'flex', justifyContent: 'space-between', width: '28vw' }}>
            { !switchState && (
              <Tooltip 
                placement='top'
                title={ toHitError 
                  ? <div style={{ textAlign: "center" }}>Invalid dice formula</div> 
                  : null
                }
              >
                <Input 
                  style={{ width : "18vw" }} 
                  placeholder="Attack roll formula" 
                  value={attackValue} 
                  status={toHitError}
                  onChange={(e) => setAttackValue(e.target.value/*.replace(/[^dDA+0-9 ]/g, "")*/)}
                  disabled={switchState}/>
              </Tooltip>
            )}

            { switchState && (
              <Select
                variant='filled'
                style={{ width: '18vw' }}
                value={saveOption}
                onChange={value => {
                  setSaveType(value)
                  setSaveOption(value)
                }}
                options={[
                  { value: 'SAVE', label: 'No damage on success' },
                  { value: 'SAVE HALF', label: 'Half damage on success' },
                ]}
              />
            )}
            <SaveSwitch 
              switchState={switchState} 
              onSwitchStateChange={setSwitchState}
              attackValue={attackValue}
              onAttackValueChange={setAttackValue} />
          </Space>
          <Space style={{ display: 'flex', justifyContent: 'space-between', width: '28vw' }}>
            <Input 
            placeholder="# of attacks"
            value={numValue}
            onChange={ (e)=>setNumValue(e.target.value.replace(/\D/g, '')) } />
          </Space>
          <Space style={{ display: 'flex', justifyContent: 'space-between', width: '28vw' }}>
            <AttackButton
              attackName={attackName}
              damageValue={damageValue}
              attackValue={attackValue}
              saveType={saveType}
              numValue={numValue}
              switchState={switchState}
              dprAttacks={dprAttacks}
              damageError={damageError}
              toHitError={toHitError}
              onDprChange={onDprChange}
            />
            <ClearButton 
                onAttackNameChange={setAttackName}
                onDamgeValueChange={setDamageValue}
                onAttackValueChange={setAttackValue}
                setSaveOption={setSaveOption}
                onNumValueChange={setNumValue}
                onSwitchStateChange={setSwitchState}
            />
          </Space>
        </Space>
      </ConfigProvider>
    </div>
  )
}

function AttackCard({ 
  setAttackName,
  setDamageValue,
  setAttackValue,
  setSaveOption,
  setNumValue,
  setSwitchState,
  attack, 
  dprAttacks, 
  onDprChange }) {

  const remove = () => {
    onDprChange(
      dprAttacks.filter(
        item => item.name != attack.name
      )
    )
  }

  const increase = () => {
    onDprChange(
      dprAttacks.map(item =>
        item.name == attack.name 
        ? { ...item, times: Number(item.times) + 1 }
        : item
      )
    )
  }

  const decrease = () => {
    if (attack.times==1) {
      remove()
    }
    else {
      onDprChange(
        dprAttacks.map(item =>
          item.name == attack.name 
          ? { ...item, times: Number(item.times) - 1 }
          : item
        )
      )
    }
  }

  const edit = () => {
    setAttackName(attack.name)
    setDamageValue(attack.damagef)
    if (attack.hitf.includes("SAVE")) {
      setSwitchState(true)
      setSaveOption(attack.hitf)
      setAttackValue("")
    } else {
      setSwitchState(false)
      setAttackValue(attack.hitf)
    }
    setNumValue(attack.times)
    remove()
  }

  return (
    <div className='attack-card'>
      <ConfigProvider 
        theme={{ 
          algorithm: theme.darkAlgorithm,
        }}
      >
        <Card 
          size="small" 
          title={attack.name}
          style={{ width:"28vw"}}
          extra={
            <Flex wrap gap="2px">
              <Tooltip title="edit">
                <Button
                  color='blue' 
                  variant='link'
                  size="small" 
                  shape='circle' 
                  className="no-focus-ring" 
                  icon={<EditOutlined />}
                  onClick={edit} />
              </Tooltip>
              <Tooltip title="increase">
                <Button
                  color='cyan' 
                  variant='link'
                  size="small" 
                  shape='circle' 
                  className="no-focus-ring" 
                  icon={<PlusOutlined />}
                  onClick={increase} />
              </Tooltip>
              <p style={{margin:-1, fontSize: 15}}>x{attack.times}</p>
              <Tooltip title="decrease">
                <Button
                  color='cyan' 
                  variant='link'
                  size="small" 
                  shape='circle' 
                  className="no-focus-ring" 
                  icon={<MinusOutlined />}
                  onClick={decrease} />
              </Tooltip>
              <Tooltip title="remove">
                <Button
                  color='danger' 
                  variant='link'
                  size="small" 
                  shape='circle' 
                  className="no-focus-ring" 
                  icon={<DeleteOutlined />}
                  onClick={remove} />
              </Tooltip>
            </Flex>
          } 
        >
          <p className='formula' style={{margin: 2}}>
            <span className='formula-label'> Damage Formula: </span>
            <span className='formula-value'>{attack.damagef.replace(/\+/g, '+\u200B')}</span>
          </p>
          { attack.hitf.includes("SAVE") ? 
            (
              ( attack.hitf.includes("HALF") 
              ? (<p className='formula-label' style={{margin: 2}}>
                  <span /*style={{color: '#006163ff'}}*/>Saving Throw 50% (<i>half</i> damage on success)</span>
                </p>)
              : (<p className='formula-label' style={{margin: 2}}>
                  <span /*style={{color: '#006163ff'}}*/>Saving Throw 50% (<i>no</i> damage on success)</span>
                </p>)
              )
            ) 
            : (
              <p className='formula' style={{margin: 2}}>
                <span className='formula-label'> Attack Roll Formula: </span>
                <span className='formula-value'> {attack.hitf.replace(/\+/g, '+\u200B')} </span>
              </p>
            )
          }
          
        </Card>
      </ConfigProvider>
    </div>
  )
}

function AttackDisplay({ 
  setAttackName,
  setDamageValue,
  setAttackValue,
  setSaveOption,
  setNumValue,
  setSwitchState,
  attacks, 
  onDprChange }) {

  const cards = [];

  attacks.forEach(attack => {
    cards.push(
      <AttackCard 
        setAttackName={setAttackName}
        setDamageValue={setDamageValue}
        setAttackValue={setAttackValue}
        setSaveOption={setSaveOption}
        setNumValue={setNumValue}
        setSwitchState={setSwitchState}
        attack={attack} 
        dprAttacks={attacks} 
        onDprChange={onDprChange} />
    )
  });

  return (
    <div 
      className='scrollable card-container'
      style=
      {{
        overflowY: 'auto',
        paddingTop: 10,
        paddingBottom: 10
      }}
    >
      <Flex className='attack-display' vertical gap={"small"}>
        {cards}
      </Flex>
    </div>
    
  )
}

function AnalyzerConfiguration({
  buildTitle,
  dprAttacks,
  setLastTestAC,
  setLastGraphColor,
  setLastMinAC,
  setResultAvgs,
  setCrossSection,
  setThreeD
}) {
  const [acError, setACError] = useState('')

  const [minAC, setMinAC] = useState('10')
  const [maxAC, setMaxAC] = useState('25')
  const [testAC, setTestAC] = useState('15')
  const [graphColor, setGraphColor] = useState('#21b1ceff') //21b1cef2
  const [isCrit, setIsCrit] = useState(true)

  useEffect( () => {
    if (Number(minAC)>=Number(maxAC)) {
      setACError('error')
    } else {
      setACError('')
    }

  }, [minAC, maxAC])

  const payload = () => {
    return {
      title : buildTitle,
      attacks : dprAttacks,
      acs : {
        min : minAC,
        max : maxAC,
        test : testAC
      },
      theme : graphColor,
      isCritFail : isCrit
    }
  }

  const handleSubmit = async () => {
    setLastTestAC(testAC)
    setLastGraphColor(graphColor)
    setLastMinAC(minAC)
    try {
      const response1 = await axios.post('http://localhost:5001/api/averages', payload());
      setResultAvgs(response1.data.result)

      const response2 = await axios.post('http://localhost:5001/api/cross-section', payload());
      setCrossSection(response2.data.result)

      const response3 = await axios.post('http://localhost:5001/api/three-d', payload());
      setThreeD(response3.data.result)
      console.log(response3.data.result)
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const toggleMisses = () => {
    setIsCrit(!isCrit)
  }

  return (
    <div class="attack-input">
      <Flex gap={8} style={{width: "28vw"}}>
        <Tooltip 
          placement='top'
          title={ acError
            ? <div style={{ textAlign: "center" }}>Min AC must be lower than Max AC</div> 
            : null
          }
        >
          <Input 
            addonBefore="Min AC: " 
            count = {{
              max: 2, 
              exceedFormatter: (txt, { max }) => runes(txt).slice(0, max).join('')
            }}
            status={acError}
            value={minAC}
            onChange={ (e)=> setMinAC(e.target.value.replace(/\D/g, '')) }
          />
        </Tooltip>
        <Tooltip 
          placement='top'
          title={ acError
            ? <div style={{ textAlign: "center" }}>Max AC must be greater than Min AC</div> 
            : null
          }
        >
          <Input 
            addonBefore="Max AC: " 
            count = {{
              max: 2, 
              exceedFormatter: (txt, { max }) => runes(txt).slice(0, max).join('')
            }}
            status={acError}
            value={maxAC}
            onChange={ (e)=> setMaxAC(e.target.value.replace(/\D/g, '')) }
          />
        </Tooltip>
        <Input 
            addonBefore="Test AC: " 
            count = {{
              max: 2, 
              exceedFormatter: (txt, { max }) => runes(txt).slice(0, max).join('')
            }}
            value={testAC}  
            onChange={ (e)=> setTestAC(e.target.value.replace(/\D/g, '')) }
          />
      </Flex>
      <Space style={{ display: 'flex', justifyContent: 'space-between', width: '28vw' }}>
        <ColorPicker
          style={{marginTop: 12}}
          value={graphColor}
          showText={color => <span>Graph Color</span>}
          onChange={c => {
            setGraphColor(c.toHexString());
          }}
        />
        <Checkbox onChange={toggleMisses}>Evaluate Crit/Fail</Checkbox>
        <Button 
          color='green' 
          variant='solid' 
          icon={<CheckOutlined />}
          style={{paddingLeft: 15, paddingRight: 15, marginTop: 6, marginLeft: 0}} 
          disabled={(acError=='error' || dprAttacks.length==0) ? true : false}
          onClick={handleSubmit}
        >Analyze</Button>
      </Space>
      
    </div>
  )
}

function AverageLine({ 
  lastTestAC, 
  lastGraphColor, 
  lineCore 
}) {
  const ac = lineCore[0]
  const damage = lineCore[1]

  return (
    <div>
      <Text style={{fontSize: '22px'}}>
        { ac==Number(lastTestAC) 
            ? <div><span className='formula-label'>AC {ac}: </span> <span style={{color: lastGraphColor}}> {damage} </span></div> 
            : <div><span className='formula-label'>AC {ac}: </span> {damage}</div> }
      </Text>
    </div>
  )
}

function AveragesDisplay({
  lastTestAC,
  lastGraphColor,
  resultAvgs
}) {

  const avgs = Object.entries(resultAvgs)
  
  const column1 = []
  for (let i=0; i<(avgs.length/2); i++) {
    column1.push(
      <AverageLine 
        lastTestAC={lastTestAC}
        lastGraphColor={lastGraphColor}
        lineCore={avgs[i]}
      />
    )
  }

  const column2 = []
  for (let i=(avgs.length/2); i<avgs.length; i++) {
    column2.push(
      <AverageLine
        lastTestAC={lastTestAC}
        lastGraphColor={lastGraphColor}
        lineCore={avgs[i]}
      />
    )
  }

  return (
    <div>
      <Row gutter={24} style={{marginLeft: 0}}>
        <Col span={11}>
          {column1}
        </Col>
        <Col span={11}>
          {column2}
        </Col>
      </Row>
    </div>
  )
}

function AveragesGraph({ lastGraphColor, resultAvgs }) {
  const plotRef = useRef(null);

  useEffect(() => {
    const acValues = Object.keys(resultAvgs); //
    const avgDamage = Object.values(resultAvgs); //

    const trace = {
      x: acValues,
      y: avgDamage,
      type: "bar",
      marker: {
        color: lastGraphColor,
        line: { width: 1.5, color: "transparent" }
      }
    };

    const layout = {
      title: {text : "Average Damage per AC", yanchor: "center", y: 0.96, pad: { t: 5 }}, 
      plot_bgcolor : "#141414",
      paper_bgcolor : "#141414",
      font: { color : "white" },
      xaxis: { title : {text : "AC", standoff : 8}, tickmode: "linear" }, 
      yaxis: { title : {text : "Average Damage"} }, 
      autosize : true,
      margin: { l: 45, r: 25, t: 50, b: 130 }
    };

    const config = { responsive: true };

    Plotly.newPlot(plotRef.current, [trace], layout, config);
  }, [resultAvgs]);

  return <div ref={plotRef}  />

}

function CrossSectionGraph({ lastTestAC, lastGraphColor, crossSection }) {
  const crossRef = useRef(null);

  useEffect(() => {
    const damageValues = Object.keys(crossSection);
    const probabilities = Object.values(crossSection); 

    const trace = {
      x: damageValues,
      y: probabilities,
      type: "bar",
      marker: {
        color: lastGraphColor,
        line: { width: 1.5, color: lastGraphColor }
      }
    };

    const layout = {
      title: {text : "Damage Distribution for AC " + lastTestAC, yanchor: "center", y: 0.96, pad: { t: 5 }},
      plot_bgcolor : "#141414",
      paper_bgcolor : "#141414",
      font: { color : "white" },
      xaxis: { title : {text : "Damage", standoff : 8}, /*tickmode: "linear"*/ }, 
      yaxis: { title : {text : "Probability"} }, 
      autosize : true,
      margin: { l: 45, r: 25, t: 50, b: 130 }
    };

    const config = { responsive: true };

    Plotly.newPlot(crossRef.current, [trace], layout, config);
  }, [crossSection]);

  return <div ref={crossRef}  />
}

function ThreeDGraph({ lastGraphColor, lastMinAC, threeD }) {
  const threeRef = useRef(null)
  const [camera, setCamera] = useState(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  // Dynamic resizing
  useEffect(() => {
    const updateSize = () => {
      const w = window.innerWidth * 0.34 - 19; // equivalent to calc(50vw - 19px)
      const h = window.innerHeight * 0.5 - 19; // for example
      setSize({ width: w, height: h });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Main surface plot
  useEffect(() => {
    const y1 = ( threeD != null ? Object.keys(threeD).map(Number) : [0])
    const x1 = ( threeD != null ? Object.keys(threeD[y1[lastMinAC]]).map(Number) : [0]) // change y1[10] to y1[lastMinAC] ASAP
    const z1 = ( threeD != null 
      ? y1.map(yVal => {
          const row = threeD[yVal];
          return x1.map(xVal => row[xVal] ?? null); // null for missing values
        })
      : [[0]] 
    )

    const surfacecolor = z1.map((row, i) =>
      row.map((zVal, j) => {
        const xVal = j;        // x inferred from column index
        // Relationship: f(x, z)
        return xVal * zVal;    // Example function
      })
    ); // customize color mapping function here

    const z_data = {
      x: x1,
      y: y1,
      z: z1, 
      type: 'surface', 
      hovertemplate: "Damage: %{x}<br>"+"AC: %{y}<br>"+"Probability: %{z}<br><extra></extra>",
      surfacecolor: surfacecolor,
      colorscale: [[0, "#bcf4ffff"], [1, lastGraphColor]], //lastGraphColor
      showscale: false
    }; // enable color gradient here

    var layout = {
      title: {
        text: 'Damage Distributions for ACs 10 to 25',
        yanchor: "center", 
        y: 0.96, 
        pad: { t: 5 }
      },
      plot_bgcolor : "#141414", 
      paper_bgcolor : "#141414",
      font: { color : "white" },
      scene: {
        camera: 
          {
            center: { x: 0.08, y: 0.01, z: -0.16 },
            eye: {x: 1.4, y: 1.34, z: 0.66}
          },
        xaxis: { 
          title: {text : "Damage"},
          tickfont: { color: "white" },
          gridcolor: "white",
          zerolinecolor: "white",
          //spikecolor: "white",
         },
        yaxis: { 
          title: {text : "AC"},
          gridcolor: "white",
          zerolinecolor: "white",
          //spikecolor: "white",
       },
        zaxis: { 
          title: {text : "Probability"},
          gridcolor: "white",
          zerolinecolor: "white",
          //spikecolor: "white",
         },
      },
      autosize: false,
      width: size.width,
      height: size.height,
      margin: {
        l: 10,
        r: 10,
        b: 15,
        t: 35,
      }
    };

    Plotly.newPlot(threeRef.current, [z_data], layout);

    const handleRelayout = (eventData) => {
      if (eventData["scene.camera"]) {
        console.log("Updated camera:", eventData["scene.camera"]);
        setCamera(eventData["scene.camera"]); // update state
      }
    };

    threeRef.current.on("plotly_relayout", handleRelayout);

    return () => {
      if (threeRef.current) {
        threeRef.current.removeAllListeners("plotly_relayout");
      }
    };
  }, [size, lastGraphColor, threeD]);
  
  return <div ref={threeRef} />
}

function App() {
  const [buildTitle, setBuildTitle] = useState("New Build Round 1")
  const [dprAttacks, setAttacks] = useState([])

  const [attackName, setAttackName] = useState("")
  const [damageValue, setDamageValue] = useState("")
  const [attackValue, setAttackValue] = useState("")
  const [numValue, setNumValue] = useState("")
  const [switchState, setSwitchState] = useState(false)

  const [saveOption, setSaveOption] = useState('SAVE')

  const [lastTestAC, setLastTestAC] = useState('15')
  const [lastGraphColor, setLastGraphColor] = useState('#21b1cef2')
  const [lastMinAC, setLastMinAC] = useState('10')
  const [resultAvgs, setResultAvgs] = useState([])
  const [crossSection, setCrossSection] = useState([])
  const [threeD, setThreeD] = useState(null)

  return (
    <>
      <ConfigProvider theme=
        {{ 
          algorithm: theme.darkAlgorithm
        }}
      >
        <div class="grid-container">
          <div class="item1">
            <CrossSectionGraph 
              lastTestAC={lastTestAC}
              lastGraphColor={lastGraphColor}
              crossSection={crossSection}/>
          </div>
          <div class="item2">
            <ThreeDGraph 
              lastGraphColor={lastGraphColor}
              lastMinAC={lastMinAC}
              threeD={threeD}
            />
          </div>
          <div class="item3">
              <div class="analyzer-title" style={{width: "28vw", marginLeft: "2.1vw", marginTop: "25px"}}>
                  <Title 
                    level={3} 
                    style={{ margin: 0 }}
                    editable={{ 
                      onChange: setBuildTitle,
                      icon: <EditOutlined style={{fontSize: '18px', marginLeft: '5px'}} />
                     }}
                  >{buildTitle}</Title>
              </div>
              <div style={{paddingTop: 15}}>
                <AttackInput
                  attackName={attackName}
                  damageValue={damageValue}
                  attackValue={attackValue}
                  saveOption={saveOption}
                  numValue={numValue}
                  switchState={switchState} 
                  dprAttacks={dprAttacks} 
                  setAttackName={setAttackName}
                  setDamageValue={setDamageValue}
                  setAttackValue={setAttackValue}
                  setSaveOption={setSaveOption}
                  setNumValue={setNumValue}
                  setSwitchState={setSwitchState}
                  onDprChange={setAttacks}/>
              </div>  
              <div style={{paddingTop: 15}}>
                <AttackDisplay 
                  setAttackName={setAttackName}
                  setDamageValue={setDamageValue}
                  setAttackValue={setAttackValue}
                  setSaveOption={setSaveOption}
                  setNumValue={setNumValue}
                  setSwitchState={setSwitchState}
                  attacks={dprAttacks}
                  onDprChange={setAttacks}/>
              </div>
              <div style={{paddingTop: 25}}>
                <AnalyzerConfiguration 
                    buildTitle={buildTitle}
                    dprAttacks={dprAttacks}
                    setLastTestAC={setLastTestAC}
                    setLastGraphColor={setLastGraphColor}
                    setLastMinAC={setLastMinAC}
                    setResultAvgs={setResultAvgs}
                    setCrossSection={setCrossSection}
                    setThreeD={setThreeD}
                />
              </div>
          </div>
          <div class="item4">
            <AveragesGraph 
              lastGraphColor={lastGraphColor}
              resultAvgs={resultAvgs}/>
          </div>
          <div class="item5">
            <Title level={4} style={{color: '#5f5f5f'}}>Average Damage per AC</Title>
            <AveragesDisplay
              lastTestAC={lastTestAC}
              lastGraphColor={lastGraphColor}
              resultAvgs={resultAvgs}/>
          </div> 
        </div>
      </ConfigProvider>
    </>
  )

}

export default App
