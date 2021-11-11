require ('dotenv').config()

const {CONNECTION_STRING} = process.env

const Sequelize = require('sequelize')
const sequelize = new Sequelize(CONNECTION_STRING, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
          rejectUnauthorized: false
      }
  }
})

let nextEmp = 5

module.exports = {
    getAllClients: (req, res) => {
        sequelize
            .query(`SELECT * FROM cc_users AS usr
            JOIN cc_clients AS clt
            ON usr.user_id = clt.user_id;`)
            .then((dbRes) => res.status(200).send(dbRes[0]))
            .catch(err => console.log(err))
    },
    getPendingAppointments: (req, res) => {
        sequelize
            .query(`SELECT * FROM cc_appointments
            WHERE approved = false
            ORDER BY date DESC;`)
            .then((dbRes) => res.status(200).send(dbRes[0]))
            .catch(err => console.log(err))
    },
    getPastAppointments: (req, res) => {
        sequelize
            .query(`SELECT appt.appt_id, appt.date, appt.service_type, appt.notes, usr.first_name, usr.last_name
            FROM cc_appointments AS appt
            JOIN cc_emp_appts AS eappt
            ON appt.appt_id = eappt.appt_id
            JOIN cc_employees AS emp
            ON eappt.emp_id = emp.emp_id
            JOIN cc_users AS usr
            ON emp.user_id = usr.user_id
            WHERE appt.approved = true AND appt.completed = true
            ORDER BY appt.date DESC;`)
            .then((dbRes) => res.status(200).send(dbRes[0]))
            .catch(err => console.log(err))
    },
    // below function was already completed 
    getUpcomingAppointments: (req, res) => {
        sequelize.query(`select a.appt_id, a.date, a.service_type, a.approved, a.completed, u.first_name, u.last_name 
        from cc_appointments a
        join cc_emp_appts ea on a.appt_id = ea.appt_id
        join cc_employees e on e.emp_id = ea.emp_id
        join cc_users u on e.user_id = u.user_id
        where a.approved = true and a.completed = false
        order by a.date desc;`)
            .then(dbRes => res.status(200).send(dbRes[0]))
            .catch(err => console.log(err))
    },
    // below function had some code provided, destructured apptId and INSERT/VALUES needed for SQL query for below function.
    approveAppointment: (req, res) => {
        let {apptId} = req.body
    
        sequelize.query(`UPDATE cc_appointments
        SET approved = true
        WHERE appt_id = ${apptId};

        insert into cc_emp_appts (emp_id, appt_id)
        values (${nextEmp}, ${apptId}),
        (${nextEmp + 1}, ${apptId});
        `)
            .then(dbRes => {
                res.status(200).send(dbRes[0])
                nextEmp += 2
            })
            .catch(err => console.log(err))
    },
    completeAppointment: (req, res) => {
        sequelize
            .query(`UPDATE cc_appointments
            SET completed = true
            WHERE appt_id = ${req.body.apptId}`)
            .then((dbRes) => res.status(200).send(dbRes[0]))
            .catch(err => console.log(err))
    },
}
