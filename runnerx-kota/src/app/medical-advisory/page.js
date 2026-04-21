export const metadata = {
  title: 'Medical Advisory',
  description:
    'Medical advisory for RunnerX Kota Marathon participants covering pre-race screening, race-day safety, and post-race recovery guidance.',
};

const preParticipationQuestions = [
  'Has your doctor ever informed you that you have a heart condition or high blood pressure?',
  'Do you feel pain or discomfort in your chest at rest, during daily activities, or during physical activity?',
  'Do you lose balance because of dizziness, or have you fainted or lost consciousness in the last 12 months?',
  'Have you ever been diagnosed with another chronic medical condition (other than heart disease or high blood pressure)?',
  'Are you currently taking prescribed medication for any chronic or ongoing medical condition?',
  'Do you currently have (or have had within the past 12 months) a bone, joint, or soft tissue (muscle, ligament, or tendon) problem that could be made worse by becoming more physically active?',
  'Has your doctor ever said that you should only do medically supervised physical activity?',
];

const warningSymptoms = [
  'Chest pain or tightness',
  'Severe or unusual shortness of breath',
  'Dizziness, confusion, or loss of balance',
  'Irregular heartbeat or palpitations',
  'Severe muscle cramps or stiffness',
  'Extreme or unusual fatigue',
];

const responsibilityPoints = [
  'Medical support will be available during the event, including trained medical personnel and ambulance services to provide assistance in case of emergencies.',
  'Participation in the Kota Half Marathon 2026 is voluntary, and each participant assumes full responsibility for their own health, fitness, and preparedness.',
  'It is the sole discretion and responsibility of the participant to decide whether to participate on race day if it coincides with a religious and/or cultural festivity wherein he/she follows a choice to fast.',
  'Remain aware of expected weather conditions and the potential impact of temperature changes during the race.',
  'Plan and follow an appropriate hydration strategy based on your individual needs.',
  'If you experience any medical symptoms or discomfort, seek assistance from the nearest medical personnel immediately.',
];

export default function MedicalAdvisoryPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Medical Advisory</h1>
          <p className="page-hero-subtitle">
            Pre-race screening, race day safety, and post-race recovery guidance for participants.
          </p>
        </div>
      </section>

      <div className="legal-content">
        <p className="last-updated">Last updated: April 18, 2026</p>

        <h2>Pre-Participation Health Screening</h2>
        <p>
          Before participating on race day, please review these medical scenarios based on the 2020
          PAR-Q+:
        </p>
        <ol>
          {preParticipationQuestions.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ol>
        <p>
          The above questionnaire helps identify any potential health risks associated with physical
          activity. You are strongly advised to consult your personal physician before embarking on
          training and participating in the race.
        </p>
        <p>
          If your answer to any of the above questions is YES to any of the above 2020 PAR-Q+
          questions, it is even more important that you seek medical advice before you commence
          training and participate on race day.
        </p>
        <p>
          While long-distance running has its health benefits, it is important to acknowledge the
          inherent risks associated with covering extended distances. Train responsibly and ensure
          you are fit to participate safely.
        </p>
        <p>
          Only a doctor who is familiar with your medical history, current health status,
          medications, and pre-existing risk factors can provide appropriate guidance regarding your
          participation.
        </p>

        <h2>Understanding the Physical Demands and Risks</h2>
        <p>
          Long-distance running puts continuous strain on the heart, lungs, muscles, and the
          body&apos;s ability to manage heat over a sustained period. If a participant is not properly
          prepared, they may struggle to maintain a steady pace or complete the distance
          comfortably.
        </p>
        <p>
          On the other hand, experienced runners may push themselves too hard in an attempt to
          improve performance, which can place additional stress on the body. In both cases, this
          can lead to fatigue, dehydration, muscle strain, or other physical problems during the
          run.
        </p>
        <p>
          Participants are therefore advised to run at a comfortable and controlled pace, stay aware
          of how their body feels, and avoid pushing beyond their current level of fitness.
        </p>

        <h2>Pre-Race, Race Day &amp; Post-Race Medical Guidelines</h2>

        <h2>1. Pre-Race Health Guidelines</h2>
        <p><strong>A. Medical Fitness</strong></p>
        <ul>
          <li>
            Participants should assess their medical fitness prior to race day and undergo a health
            check-up.
          </li>
          <li>
            Individuals with a history of heart conditions, high blood pressure, asthma, diabetes,
            or any recent illness, surgery, or ongoing treatment should consult a qualified medical
            practitioner before participating.
          </li>
        </ul>
        <p><strong>B. Training Readiness</strong></p>
        <ul>
          <li>Only runners who have adequately trained for their chosen distance should participate.</li>
          <li>Participants should avoid last-minute intense training sessions before race day.</li>
          <li>
            Do not participate if you are injured, unwell, or sleep-deprived, as this increases the
            risk of injury and medical complications.
          </li>
        </ul>
        <p><strong>C. Hydration &amp; Nutrition</strong></p>
        <ul>
          <li>Maintain proper hydration in the days leading up to the event.</li>
          <li>Avoid alcohol and heavy meals at least 24 hours before the race.</li>
          <li>
            Consume a light, carbohydrate-rich meal 2 to 3 hours before the start to support energy
            requirements during the run.
          </li>
          <li>Do not experiment with new food, supplements, or gear on race day.</li>
        </ul>

        <h2>2. Race Morning (Before Arrival &amp; At Venue)</h2>
        <p>
          <strong>A. Expected Conditions:</strong> Temperature approximately 24 C to 34 C based on
          forecasts from AccuWeather. Expected humidity: approximately 65% to 80%, based on
          historical climate data.
        </p>
        <p>
          <strong>B. Pre-Race Nutrition &amp; Hydration:</strong> On race morning, participants should be
          well-rested and consume a light, easily digestible meal approximately 2-3 hours before
          the start. This meal should provide energy without causing heaviness or discomfort.
          Hydration should continue in moderate amounts, avoiding both dehydration and excessive
          fluid intake immediately before the race.
        </p>
        <p>
          <strong>C. Emergency Information:</strong> All participants must fill in accurate emergency
          contact details on the back of their race bib, including medical conditions, allergies,
          medications, and a reachable contact person. Incorrect or incomplete information may
          delay medical assistance in case of emergency.
        </p>
        <p>
          <strong>D. Warm-Up Routine:</strong> At the venue, participants should perform a structured
          warm-up lasting 5 to 15 minutes, including light jogging and dynamic stretching, to
          prepare muscles and joints and reduce the risk of injury.
        </p>

        <h2>3. During the Race (Execution Phase)</h2>
        <p>
          <strong>A. Pacing Strategy:</strong> Participants must begin at a controlled and sustainable
          pace, avoiding overexertion in the early stages. A gradual increase in intensity allows
          better adaptation and reduces early fatigue or cardiovascular strain. As temperature rises
          during the race, pacing should remain flexible and responsive to conditions.
        </p>
        <p>
          <strong>B. Hydration Control:</strong> Hydration should be managed carefully by drinking
          fluids based on individual needs rather than stopping at every station. Both dehydration
          and overhydration can be harmful; dehydration may cause cramps, fatigue, and heat
          exhaustion, while overhydration may lead to electrolyte imbalance. A balanced,
          experience-based approach is recommended.
        </p>
        <p>
          <strong>C. Cooling Strategy:</strong> Cooling strategies should be used to regulate body
          temperature, such as splashing water on the face, neck, and body. If feeling overheated or
          fatigued, participants should slow down or take short walking breaks rather than
          continuing at the same intensity.
        </p>

        <h2>4. Recognising Warning Signs During the Race</h2>
        <p>
          <strong>A. Body Awareness:</strong> Participants must remain aware of their physical condition
          throughout the race and not ignore early warning signals.
        </p>
        <p><strong>B. Critical Symptoms:</strong> Stop immediately and seek medical assistance if any of the following occur:</p>
        <ul>
          {warningSymptoms.map((symptom) => (
            <li key={symptom}>{symptom}</li>
          ))}
        </ul>
        <p>
          <strong>C. Immediate Action:</strong> Ignoring these symptoms can lead to serious and
          potentially life-threatening conditions. Immediate medical attention should be sought at
          the nearest aid station.
        </p>

        <h2>5. Finish Line Protocol (Immediate Post-Run Phase)</h2>
        <p>
          <strong>A. Post-Finish Movement:</strong> Upon crossing the finish line, participants must not
          stop abruptly. During prolonged running, blood circulation is directed toward the lower
          limbs, and sudden stopping can reduce blood flow to vital organs, causing dizziness,
          nausea, weakness, or fainting.
        </p>
        <p>
          <strong>B. Active Recovery:</strong> Participants should continue walking for several minutes
          after finishing to allow gradual normalisation of circulation and heart rate. This is
          essential for safe recovery.
        </p>

        <h2>6. Post-Race Recovery (Within First Few Hours)</h2>
        <p>
          <strong>A. Recovery Hydration &amp; Nutrition:</strong> After completing the race, participants
          should continue light movement and begin recovery gradually. Hydration should be resumed
          slowly rather than consuming large amounts immediately. A balanced meal with
          carbohydrates and protein should be consumed to support recovery and replenish energy.
        </p>
        <p>
          <strong>B. Post-Race Monitoring:</strong> Participants should remain alert to symptoms such as
          dizziness, breathlessness, chest discomfort, nausea, or unusual fatigue. If any of these
          occur, medical attention should be sought immediately, as proper recovery is essential to
          prevent delayed complications.
        </p>

        <h2>Medical Support and Participant Responsibility</h2>
        <ul>
          {responsibilityPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>

        <h2>Advisory Note</h2>
        <p>
          This medical advisory is provided for guidance only and does not replace professional
          medical advice. Participants are responsible for assessing their own fitness, seeking
          medical consultation where necessary, and making informed decisions regarding
          participation.
        </p>
      </div>
    </>
  );
}
