async function getSettings() {
    let settingsG
    await fetch("./settings.json").then((res)=> {
        return res.json()
    }).then((settingsRes) => {
        settingsG = settingsRes
    })
    console.log('settings', settingsG)
    return settingsG
}

async function updateStarsFromDB() {
    getSettings().then((settingsRes) => {
        console.log('update stars', settingsRes)
        let url = `http://${settingsRes.backendIP}:${settingsRes.backendPort}/stars`
        
        fetch(url).then((res)=>{
            return res.json()
        }).then((data) => {
            stars = data.stars
            redrawCanvas(skyCanvas.getContext("2d"), stars, constellations, clouds)
        })
    })
}

async function insertStarToDB(starToInsert) {
    return getSettings().then((settingsRes) => {
        let url = `http://${settingsRes.backendIP}:${settingsRes.backendPort}/stars`
        
        console.log('inserting', JSON.stringify(starToInsert))
        return fetch(url, {
            method: 'POST',
            body: JSON.stringify(starToInsert),
            headers: {
                "Content-Type": "application/json; charset=UTF-8"
            }
        }).then((res)=>{
            console.log('after insert', res)
            return res.json().then((insertRes) => {
                console.log('after insert deep', insertRes)
                return insertRes
            }).catch(() => {
                return res.json()
            })
        }).catch((res) => {
            return res
        })
    })
}

async function deleteStarFromDB(starIdToDelete) {
    return getSettings().then((settingsRes) => {
        let url = `http://${settingsRes.backendIP}:${settingsRes.backendPort}/stars/?id=${starIdToDelete}`
        
        console.log('deleting', { id: starIdToDelete })
        return fetch(url, {
            method: 'DELETE'
        }).then((res)=>{
            console.log('after delete', res)
        }).catch((res) => {
            return res
        })
    })
}

function updateStarById(id, newStar, stars) {
    let starIndex = -1
    
    const foundStar = stars.find((starIn, index)=> {
        starIndex = index
        return starIn._id === id
    })
    console.log(`search for ${id}: ${foundStar}`)
    if (foundStar !== undefined) {
        stars[starIndex] = newStar
    }
}

function getStarById(id, stars) {
    const foundStar = stars.find((starIn)=> {
        return starIn._id === id
    })
    return foundStar
}

function getStarConstellation(star, constellations) {
    console.log(`looking for ${star._id} in ${constellations}`)
    let returnConstellationIndex
    let found = constellations.find((constellation, index) => {
        returnConstellationIndex = index
        console.log(`looking star for ${star._id} in ${constellation.stars}`)
        let foundStar = constellation.stars.find((starIn) => {
            console.log(`looking stars id ${starIn._id} ${star._id}`)
            return starIn._id === star._id
        })
        console.log('result star', foundStar)
        return foundStar
    })
    console.log('result', found, returnConstellationIndex)
    return [found, returnConstellationIndex]
}

const starNames = ['Sirius', 'Andromeda', 'Sun', 'Proxima Centauri', 'Vega', 'Aldebaran', 'Bellatrix', 'Antares', 'Alphard', 'Deneb', 'Arcturus', 'Pollux', 'Betelgeuse', 'Canopus', 'Gamma Velorum', 'Gamma Cygni', 'Rigel', 'Altair', 'Alpha Centauri', 'Epsilon Aurigae', 'Canis Majoris', 'Rho Cassiopeiae', 'Mu Cephei', 'Stephenson', 'Aquilae', 'Persei']
const constellationNames = ['Orion', 'Leo', 'Cassiopeia', 'Ursa Major', 'Aries', 'Draco', 'Taurus', 'Gemini', 'Scorpius', 'Sagittarius', 'Libra', 'Perseus', 'Delphinus', 'Lyra', 'Pisces']

const STAR_RADIUS = 20

const skyCanvas = document.getElementById('sky-canvas')
skyCanvas.width = skyCanvas.getBoundingClientRect().width
skyCanvas.height = skyCanvas.getBoundingClientRect().height

const deleteModeBtn = document.getElementById('delete-mode-btn')
let isDeleteModeOn = deleteModeBtn.checked

deleteModeBtn.addEventListener('click', () => {
    isDeleteModeOn = deleteModeBtn.checked
})

const constellationModeBtn = document.getElementById('constellation-mode-btn')
let isConstellationModeModeOn = constellationModeBtn.checked

constellationModeBtn.addEventListener('click', () => {
    isConstellationModeModeOn = constellationModeBtn.checked
})

const moonPhaseRange = document.getElementById('moon-phase-range')
let moonPhase = moonPhaseRange.value

moonPhaseRange.addEventListener('input', () => {
    moonPhase = moonPhaseRange.value
    redrawCanvas(skyCanvas.getContext("2d"), stars, constellations, clouds)
})

const cloudEnabledBtn = document.getElementById('enable-clouds-btn')
let areCloudsEnabled = cloudEnabledBtn.checked

cloudEnabledBtn.addEventListener('click', () => {
    areCloudsEnabled = cloudEnabledBtn.checked
    redrawCanvas(skyCanvas.getContext("2d"), stars, constellations, clouds)
})

const cloudCountInp = document.getElementById('cloud-count-input')
let cloudCount = cloudCountInp.value

cloudCountInp.addEventListener('input', () => {
    cloudCount = cloudCountInp.value
    clouds = []
    if (cloudCount <= 0) {
        alert('Ilość chmur musi być większa od 0!')
        cloudCountInp.value = 1
        return
    }
    for (let i = 0; i < cloudCount; i ++) {
        clouds.push(new Cloud(Math.floor(Math.random() * skyCanvas.width), Math.floor(Math.random() * skyCanvas.height), (Math.random() / 2) + 0.2))
    }
    redrawCanvas(skyCanvas.getContext("2d"), stars, constellations, clouds)
})

let stars = []
let constellations = []
let clouds = []
for (let i = 0; i < cloudCount; i ++) {
    clouds.push(new Cloud(Math.floor(Math.random() * skyCanvas.width), Math.floor(Math.random() * skyCanvas.height), (Math.random() / 2) + 0.2))
}

const starNameInp = document.getElementById('star-name-inp')
const starIdInp = document.getElementById('star-id-inp')
const constellationNameInp = document.getElementById('constellation-name-inp')
const updateStarBtn = document.getElementById('update-star-btn')

updateStarBtn.addEventListener('click', ()=> {
    let oldStar = getStarById(starIdInp.value, stars)
    oldStar.starName = starNameInp.value
    updateStarById(starIdInp.value, oldStar, stars)
    let [constellation] =  getStarConstellation(oldStar, constellations)
    if (constellation) {
        constellation.name = constellationNameInp.value
    }
    redrawCanvas(skyCanvas.getContext("2d"), stars, constellations, clouds)
})

function choose(choices) {
    const index = Math.floor(Math.random() * choices.length);
    return choices[index];
}

function drawStar(ctx, x, y, starName, fillColor) {
    let color = fillColor !== undefined? fillColor: 'white'
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, y, STAR_RADIUS/2, 0, 2*Math.PI)
    ctx.stroke()
    ctx.fill()
    ctx.closePath()
    ctx.beginPath()
    ctx.ellipse(x, y, STAR_RADIUS, STAR_RADIUS/3, 0, 0, 2*Math.PI)
    ctx.ellipse(x, y, STAR_RADIUS/3, STAR_RADIUS, 0, 0, 2*Math.PI)
    ctx.fill()
    ctx.closePath()
    ctx.strokeStyle = color
    ctx.beginPath()
    ctx.strokeText(starName, x - STAR_RADIUS/2, y + STAR_RADIUS*2)
    ctx.closePath()
}

function drawMoon(ctx, x, y, phase) {
    ctx.fillStyle = 'yellow'
    ctx.strokeStyle = 'black'
    const MOON_RADIUS = 80
    let startAngle = 0
    let endAngle = 0
    switch (phase) {
        case 0:
            startAngle = 0
            endAngle = 2*Math.PI;
            ctx.fillStyle = '#303030'
            break;
        case 3:
        case 2:
        case 1:
            startAngle = Math.PI/2
            endAngle = 3/2*Math.PI
            break
        case 4:
            startAngle = 0
            endAngle = 2*Math.PI;
            break;
    }

    ctx.beginPath()
    ctx.arc(x, y, MOON_RADIUS, startAngle, endAngle, true)
    ctx.stroke()
    ctx.fill()
    ctx.closePath()
    if (phase == 1) {
        ctx.beginPath()
        ctx.ellipse(x, y, MOON_RADIUS/2, MOON_RADIUS, 0, Math.PI/2, 3/2*Math.PI, true)
        ctx.fillStyle = '#333333'
        ctx.fill();
        ctx.closePath()
    }
    if (phase == 3) {
        ctx.beginPath()
        ctx.ellipse(x, y, MOON_RADIUS/2, MOON_RADIUS, 0, Math.PI/2, 3/2*Math.PI, false)
        ctx.fill();
        ctx.closePath()
    }
}

function drawCloud(ctx, x, y, alpha, fillColor) {
    const CLOUD_RADIUS = 80;
    const CLOUD_LEN = 200;
    let color = fillColor !== undefined? fillColor: 'white'

    let prevAlpha = ctx.globalAlpha
    ctx.fillStyle = color
    ctx.globalAlpha = alpha
    
    // draw bottom
    ctx.beginPath()
    ctx.arc(x, y, CLOUD_RADIUS, Math.PI/2, Math.PI*3/2, false)
    ctx.rect(x, y-CLOUD_RADIUS, CLOUD_LEN, CLOUD_RADIUS*2)
    ctx.arc(x + CLOUD_LEN, y, CLOUD_RADIUS, Math.PI*3/2, Math.PI/2, false)
    // draw top
    ctx.moveTo(x+CLOUD_LEN/4, y-CLOUD_RADIUS)
    ctx.arc(x+CLOUD_LEN/4, y-CLOUD_RADIUS, CLOUD_RADIUS, 0, Math.PI*2, false)
    ctx.moveTo(x+3*CLOUD_LEN/4, y-CLOUD_RADIUS)
    ctx.arc(x+3*CLOUD_LEN/4, y-CLOUD_RADIUS, CLOUD_RADIUS, 0, Math.PI*2, false)
    ctx.closePath()
    ctx.fill()

    ctx.globalAlpha = prevAlpha
}

function drawClouds(ctx, clouds) {
    for (let cloud of clouds) {
        drawCloud(ctx, cloud.x, cloud.y, cloud.alpha)
    }
}

function drawStars(ctx, stars) {
    for (let star of stars) {
        let selectedColor = 'purple'
        if (star.selected) {
            drawStar(ctx, star.x, star.y, star.starName, selectedColor)
        } else {
            drawStar(ctx, star.x, star.y, star.starName)
        }
    }
}

function drawConstellations(ctx, constellations) {
    for (let constellation of constellations) {
        ctx.strokeStyle = 'white'
        for (let point of constellation.points) {
            console.log('draw line', point)
            ctx.beginPath()
            ctx.moveTo(point[0].x, point[0].y)
            ctx.strokeText(constellation.name, point[0].x-STAR_RADIUS, point[0].y-STAR_RADIUS)
            ctx.lineTo(point[1].x, point[1].y)
            ctx.stroke()
            ctx.strokeText(constellation.name, point[1].x-STAR_RADIUS, point[1].y-STAR_RADIUS)
            ctx.closePath()
        }
    }
}

function redrawCanvas(ctx, stars, constellations, clouds) {
    ctx.clearRect(0, 0, skyCanvas.width, skyCanvas.height)
    drawStars(ctx, stars)
    drawConstellations(ctx, constellations)
    drawMoon(ctx, 100, 100, Number(moonPhase))
    if (areCloudsEnabled) {
        drawClouds(ctx, clouds)
    }
}

skyCanvas.addEventListener('click', (event) => {
    let rect = skyCanvas.getBoundingClientRect()
    let clickX = event.clientX - rect.x
    let clickY = event.clientY - rect.y
    let starId = ""

    let clickedStars = stars.filter((star)=> {
        return (Math.abs(clickX - star.x) <= STAR_RADIUS*1.5 && Math.abs(clickY - star.y) <= STAR_RADIUS*1.5)
    })
    if (clickedStars.length > 0) {
        starId = clickedStars[0]._id
    }
    console.log(`clicked star ${clickedStars} ${starId}`)

    // Add constellation connection
    if (isConstellationModeModeOn) {
        if (starId !== "") {
            let clickedStar = clickedStars[0]
            clickedStar.selected = !clickedStar.selected
            if (clickedStar.selected) {
                starNameInp.value = clickedStar.starName
                starIdInp.value = clickedStar._id
                let [constellation, _] = getStarConstellation(clickedStar, constellations)
                if (constellation !== undefined) {
                    constellationNameInp.value = constellation.name
                } else {
                    constellationNameInp.value = ""
                }
            } else {
                starNameInp.value = ""
                starIdInp.value = ""
                constellationNameInp.value = ""
            }
            updateStarById(starId, clickedStar, stars)
            let selectedStars = stars.filter((star)=> {
                return star.selected
            })
            if (selectedStars.length === 2) {
                let previousClickedStar = stars.filter((star)=> {
                    return star.selected && (star._id !== clickedStar._id)
                })[0]
                previousClickedStar.selected = false
                updateStarById(previousClickedStar._id, previousClickedStar, stars)
                clickedStar.selected = false
                updateStarById(clickedStar._id, clickedStar, stars)

                let [const1, const1Ind] = getStarConstellation(previousClickedStar, constellations)
                let [const2, const2Ind] = getStarConstellation(clickedStar, constellations)
                console.log('prev const', const1, const1Ind)
                console.log('new const', const2, const2Ind)

                if (const1 !== undefined || const2 !== undefined) {
                    if (const1 !== undefined && const2 === undefined) { // first clicked was in constellation, second wasnt
                        const1.addStarAfter(previousClickedStar, clickedStar)
                        console.log('added star to exsting')
                    } else if (const1 === undefined && const2 !== undefined ) { // first clicked wasnt in canstellation, second was
                        const2.addStarAfter(clickedStar, previousClickedStar)
                        console.log('added star to exsting')
                    } else if (const1Ind === const2Ind) { // both were in constellation (only legal if they were in the same constellation)
                        let isPointAdded = const1.addStarAfter(clickedStar, previousClickedStar)
                        console.log('is point added', isPointAdded)
                        if (isPointAdded) {
                            const1.removePoint(isPointAdded)
                        }
                        console.log('added star to exsting')
                    }
                } else {
                    const newConstellation = new Constellation(choose(constellationNames),  previousClickedStar, clickedStar)
                    constellations.push(newConstellation)
                    console.log('new constellation', newConstellation)
                }
                console.log('all constellations', constellations)
            }

            redrawCanvas(skyCanvas.getContext("2d"), stars, constellations, clouds)
        }
    }

    // Add star
    if (clickedStars.length <= 0 && !isDeleteModeOn && !isConstellationModeModeOn) {
        let newStar = new Star(clickX, clickY, choose(starNames))
        insertStarToDB(newStar).then((resp) => {
            console.log('after insert 2', resp.id)
            newStar._id = resp.id
            stars.push(newStar)
            redrawCanvas(skyCanvas.getContext("2d"), stars, constellations, clouds)
        })
    }
    // Delete star
    if (isDeleteModeOn && clickedStars.length > 0) {
        console.log('existing', clickedStars)
        let [constellationToUpdate, _] = getStarConstellation(clickedStars[0], constellations)
        if (constellationToUpdate) {
            constellationToUpdate.removeStar(clickedStars[0])
        }
        deleteStarFromDB(clickedStars[0]._id).then(()=> {
            updateStarsFromDB()
        })
    }
})

updateStarsFromDB()
