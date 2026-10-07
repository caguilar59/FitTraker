const calendarEvent = {
    props: {
        currentDate: String,
        blockInfo: String,
        buttonBlock: String
    },

    template: `
        <div class="col">
            <div class="calendar-event card p-3 h-100">
                <h5>{{ currentDate }}</h5>
                <button class="btn btn-primary btn-sm add-event-btn">
                    <i class="bi bi-plus-lg"></i>
                </button>
                <p class="mt-3 mb-0">{{ blockInfo }}</p>
            </div>
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