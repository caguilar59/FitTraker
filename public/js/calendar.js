const calendarEvent = {
    props: {
        currentDate: String,
        blockInfo: String,
        buttonBlock: String
    },

    template: `
        <div class="calendar-card">
            <h6>{{ currentDate }}</h6>
            <button class="btn btn-secondary btn-sm add-event-btn">
                <i class="bi bi-plus-lg"></i>
            </button>
            <p>{{ blockInfo }}</p>
        </div>
    `
};

window.calendarEvent = calendarEvent;

new Vue({
    el: '#calendar',

    components: {
        'calendar-event': window.calendarEvent
    },

    data: {
        calendarDays: Array.from({ length: 7 }, (_, index) => {
            const date = new Date();

            date.setDate(date.getDate() + index);

            return {
                currentDate: date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric'
                }),
                blockInfo: 'No Program',
                buttonBlock: 'Add Lift'
            };
        })
    }
});