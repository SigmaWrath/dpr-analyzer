import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Input, Space, Switch, ConfigProvider, theme, Button, Card, Flex, Tooltip, Typography, ColorPicker, Checkbox } from "antd";
import { CheckOutlined, DeleteOutlined, EditOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import './App.css'
const {Title} = Typography

/*
function App() {
  const [count, setCount] = useState(0)
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const fetchTime = () => {
      fetch('/api/time')
        .then(res => res.json())
        .then(data => {
          setCurrentTime(data.time);
        });
    };

    fetchTime(); // fetch immediately
    const interval = setInterval(fetchTime, 1000); // every second

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>The current time is {new Date(currentTime * 1000).toLocaleString()}.</p>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      
      <h3> Average Damage per AC</h3>
      <p>
        AC 10: 155 <br  />
        AC 11: 150 <br  />
        AC 12: 145 <br  />
        AC 13: 140 <br  />
      </p>
      
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}*/


const ATTACKS = [
  {
    name: "Eldritch Blast w/ Agonizing Blast Invocation",
    damagef: "1d10+3",
    hitf: "1d20+5",
    times: 1,
  },
  {
    name: "Witch Bolt as Turn 2 Bonus Action",
    damagef: "1d12",
    hitf: "1d20+5",
    times: 1,
  },
  {
    name: "Greatsword GWF+GWM, Fire's Burn, Divine Favor, Rage, Zealot, Flourish, Divine Smite 4, Radiant Strikes, Boon of Combat Prowess", 
    damagef: "2d6+6+1+6+1d10+1d4+2+1d6+2+1d6+5d8+1d8", 
    hitf: "30", 
    times: 1
  },
  {
    name: "Greatsword GWF+GWM, Fire's Burn, Divine Favor, Rage, Divine Smite 4, Radiant Strikes, Reckless Attack, Sacred Weapon", 
    damagef: "2d6+6+1+6+1d10+1d4+2+5d8+1d8", 
    hitf: "Ad20+6+6+4", 
    times: 1
  }
]

const ATTACKS2 = [
  {
    name: "Witch Bolt",
    damagef: "2d12",
    hitf: "1d20+5",
    times: 1
  },
  {
    name: "Unarmed Strike (Action + Flurry of Blows Bonus Action)",
    damagef: "1d6+3",
    hitf: "1d20+5",
    times: 3
  },
  {
    name: "Chromatic Orb",
    damagef: "3d8",
    hitf: "1d20+5",
    times: 1
  },
  {
    name: "Heavy Crossbow + Ranger's Quarry",
    damagef: "1d10+3+1d4",
    hitf: "1d20+7",
    times: 1
  },
  {
    name: "Scimitar Nick (Bonus Action)",
    damagef: "1d6",
    hitf: "1d20+5",
    times: 1
  },
  {
    name: "Scimitar (Action + Action Surge)",
    damagef: "1d6+3",
    hitf: "1d20+5",
    times: 2
  },

]

/* TODO: 
*   1. Reconfigure the 3rd panel to have a max height, so that the bottom bar doesn't overflow due to long top text. 
          After that's done, we can set a quasi-maximally generous character limit on top text 
            (assuming all widest character, how many characters before weird shit happens?)
        No narrower to 415 px, no shorter than 530
    2. Saving throws: 2) Half damage on successful save
    3. Refactor project and commit to GitHub
    4. PHASE 4: Configue dpr_core and api for integration
    5. PHASE 5: GRAPHS
*/

// Perfectionism:
// 1. Make tooltip for invalid dice formula show up immediately without having to hover away and back. 
//      Hint: I already tried getting rid of the ternary and using a state for that, so that's not it.

// Ask for Opinions:
//    1. Confine AnalyzerConfiguration to the bottom of the page ??
//    2. Confirmation Modal for removing attack cards?

// Idea: Ability to save config from website as a JSON file? And then reupload later. 
// UI would be a float button that opens up a drawer for this.

function SaveSwitch({
  switchState, 
  onSwitchStateChange, 
  attackValue,
  onAttackValueChange
}) {

  const toggle = () => {
    onSwitchStateChange(!switchState)
    /*if (attackValue != "") {
      onAttackValueChange("")
    }*/

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
        && ((attack.hitf==attackValue.replace(/[\s\u00A0\u200B-\u200D\uFEFF]/g, '') && !switchState) || (attack.hitf=="SAVE" && switchState)) ) {
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
        //alert("Attacks with different properties must have unique names.")
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
              hitf: "SAVE",
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
    <Button disabled={submitDisabled} style={{ marginTop: 6}} type='primary' onClick={addAttack}>+ Add Attack</Button>
    
  )
}

function ClearButton({
  onAttackNameChange,
  onDamgeValueChange,
  onAttackValueChange,
  onNumValueChange,
  onSwitchStateChange
}) {
  const clearText = () => {
    onAttackNameChange("")
    onDamgeValueChange("")
    onAttackValueChange("")
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
  numValue,
  switchState,
  dprAttacks, 
  setAttackName,
  setDamageValue,
  setAttackValue,
  setNumValue,
  setSwitchState,
  onDprChange 
}) {
  

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
            && ((attack.hitf==attackValue.replace(/[\s\u00A0\u200B-\u200D\uFEFF]/g, '') && !switchState) || (attack.hitf=="SAVE" && switchState)) ) ) {
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

  }, [damageValue, attackValue, attackName, switchState, dprAttacks])

  // Function to check a whether a string is a valid DiceFormula
  const checkFormulaPattern = (pattern) => {
    var isFormula = true

    const diceRoll = /^\d+d\d+$/
    const advDiceRoll = /^Ad\d+$/
    const dadvDiceRoll = /^Dd\d+$/
    /*const diceRollUnstable = /^\d+d$/
    const advDiceRollUnstable = /^Ad$/
    const dadvDiceRollUnstable = /^Dd$/*/
    const modifier = /^\d+$/
    const validTerms = [diceRoll, advDiceRoll, dadvDiceRoll, modifier]

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
              numValue={numValue}
              switchState={switchState}
              dprAttacks={dprAttacks}
              damageError={damageError}
              toHitError={toHitError}
              onAttackNameChange={setAttackName}
              onDamgeValueChange={setDamageValue}
              onAttackValueChange={setAttackValue}
              onNumValueChange={setNumValue}
              onSwitchStateChange={setSwitchState}
              onDprChange={onDprChange}
            />
            <ClearButton 
                onAttackNameChange={setAttackName}
                onDamgeValueChange={setDamageValue}
                onAttackValueChange={setAttackValue}
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
    if (attack.hitf=="SAVE") {
      setSwitchState(true)
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
          { attack.hitf=="SAVE" ? (
              <p className='formula-label' style={{margin: 2}}>
                <span /*style={{color: '#006163ff'}}*/>Saving Throw 50% (no damage on success)</span>
              </p>
            ) : (
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
        paddingBottom: 10,
        // backgroundColor:'#191919',
        // border: '0px solid #272727ff', // visible border
        // borderRadius: 8,
      }}
    >
      <Flex className='attack-display' vertical gap={"small"}>
        {cards}
      </Flex>
    </div>
    
  )
}

function AnalyzerConfiguration() {
  const [hideMisses, setHideMisses] = useState(true)

  const toggleMisses = () => {
    setHideMisses(!hideMisses)
  }

  return (
    <div class="attack-input">
      <Flex gap={8} style={{width: "28vw"}}>
        <Input addonBefore="Min AC: " defaultValue={10}  />
        <Input addonBefore="Max AC: " defaultValue={25}  />
        <Input addonBefore="Test AC: " defaultValue={15} />
      </Flex>
      <Space style={{ display: 'flex', justifyContent: 'space-between', width: '28vw' }}>
        <ColorPicker
          style={{marginTop: 12}}
          defaultValue="#1f77b4"
          showText={color => <span>Graph Color</span>}
        />
        <Checkbox onChange={toggleMisses}>Hide Misses (3D)</Checkbox>
        <Button 
          color='green' 
          variant='solid' 
          icon={<CheckOutlined />}
          style={{paddingLeft: 15, paddingRight: 15, marginTop: 6, marginLeft: 0}} 
        >Analyze</Button>
      </Space>
      
    </div>
  )
}

function App() {
  const [buildTitle, setBuildTitle] = useState("New Build Round 1")
  const [dprAttacks, setAttacks] = useState([])

  const [attackName, setAttackName] = useState("")
  const [damageValue, setDamageValue] = useState("")
  const [attackValue, setAttackValue] = useState("")
  const [numValue, setNumValue] = useState("")
  const [switchState, setSwitchState] = useState(false)

  return (
    <>
      <ConfigProvider theme=
        {{ 
          algorithm: theme.darkAlgorithm
        }}
      >
        <div class="grid-container">
          <div class="item1">1</div>
          <div class="item2">2</div>

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
                  numValue={numValue}
                  switchState={switchState} 
                  dprAttacks={dprAttacks} 
                  setAttackName={setAttackName}
                  setDamageValue={setDamageValue}
                  setAttackValue={setAttackValue}
                  setNumValue={setNumValue}
                  setSwitchState={setSwitchState}
                  onDprChange={setAttacks}/>
              </div>  
              <div style={{paddingTop: 15}}>
                <AttackDisplay 
                  setAttackName={setAttackName}
                  setDamageValue={setDamageValue}
                  setAttackValue={setAttackValue}
                  setNumValue={setNumValue}
                  setSwitchState={setSwitchState}
                  attacks={dprAttacks}
                  onDprChange={setAttacks}/>
              </div>
              <div style={{paddingTop: 25}}>
                <AnalyzerConfiguration />
              </div>
          </div>
          <div class="item4">
            4
          </div>

          <div class="item5">5</div> 
        </div>
      </ConfigProvider>
    </>
  )

}

export default App
