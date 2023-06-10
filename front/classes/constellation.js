class Constellation {
    constructor(name, star1, star2) {
        this.name = name
        this.stars = [star1, star2]
        this.points = [[star1, star2]]
    }

    addStar = (star) => {
        this.stars.push(star)
    }

    addStarAfter = (firstStar, secondStar) => {
        let isfirstStarAdded = this.stars.find((star) => {
            return star._id === firstStar._id
        })
        if (!isfirstStarAdded) {
            console.log('new first star')
            this.stars.push(firstStar)
        }

        let isSecondStarAdded = this.stars.find((star) => {
            return star._id === secondStar._id
        })
        if (!isSecondStarAdded) {
            console.log('new second star')
            this.stars.push(secondStar)
        }

        let isPointAdded = this.points.find((point) => {
            return (point[0]._id === firstStar._id && point[1]._id === secondStar._id) || (point[1]._id === firstStar._id && point[0]._id === secondStar._id)
        })
        if (!isPointAdded) {
            console.log('new point')
            this.points.push([firstStar, secondStar])
        }
        return isPointAdded
    }

    removePoint = (point) => {
        this.points = this.points.filter((pointIn) => {
            return !(point[0]._id === pointIn[0]._id && point[1]._id === pointIn[1]._id) || (point[1]._id === pointIn[0]._id && point[0]._id === pointIn[1]._id)
        })
        this.stars = this.stars.filter((starIn) => {
            return this.points.find((point) => {
                return (point[0]._id === starIn._id || point[1]._id === starIn._id)
            })
        })
    }

    removeStar = (star) => {
        console.log('removing star')
        this.stars = this.stars.filter((starIn) => {
            return star._id !== starIn._id
        })
        this.points = this.points.filter((pointIn) => {
            return !pointIn.find((starIn) => {
                return starIn._id === star._id
            })
        })
    }
}