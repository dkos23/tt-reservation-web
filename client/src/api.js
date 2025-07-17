import { RESERVATION_TYPES } from './ReservationTypes';
import { reservationOverlap } from './helper';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const BASE_PATH = '/api';

export const getBaseDataApi = {
    url: `${BASE_PATH}/base-data`,
    setFunc: ({ res }) => {
        console.log("🛠️ getBaseDataApi setFunc called with:", res);
        return res;
    }
};

// export const patchConfigApi = {
//     url: `${BASE_PATH}/config`,
//     method: 'PATCH',
//     setFunc: ({ cur, req }) => {
//         console.log("🛠️ patchConfigApi setFunc called with:", { cur, req });
//         return {
//             ...cur,
//             ...req,
//         };
//     },
// };
export const patchConfigApi = {
  url: `${BASE_PATH}/config`,
  method: 'PATCH',
  prepareBody: req => {
    const mapKeys = {
      announcement: 'announcement',
      visibleHours: 'visible_hours',
      orgName: 'org_name',
      serverMail: 'server_mail',
      url: 'url',
      reservationDaysInAdvance: 'reservation_days_in_advance',
      reservationMaxActiveCount: 'reservation_max_active_count',
      timeZone: 'time_zone',
    };

    const body = {};
    for (const key in req) {
      if (mapKeys[key]) {
        body[mapKeys[key]] = req[key];
      }
    }
    return body;
  },
  setFunc: ({ cur, req }) => ({
    ...cur,
    ...req,
  }),
};

export const putCourtsApi = {
    url: `${BASE_PATH}/courts`,
    method: 'PUT',
    setFunc: ({ req }) => req,
};

export const postLoginApi = {
    url: `${BASE_PATH}/login`,
    method: 'POST',
};

export const postLogoutApi = {
    url: `${BASE_PATH}/logout`,
    method: 'POST',
};

export const postRegisterApi = {
    url: `${BASE_PATH}/register`,
    method: 'POST',
};

export const getReservationsApi = {
    url: `${BASE_PATH}/reservations`,
    method: 'GET',
    setFunc: ({ res }) => res.map(r => ({
        ...r,
        id: r.reservation_id,
        courtId: r.court_id,
        userId: r.user_id,
        from: dayjs(r.from_time).tz("Europe/Berlin"),
        to: dayjs(r.to_time).tz("Europe/Berlin"),
        groupId: r.group_id,
        created: r.created,
        text: r.text,
        type: r.type,
        name: r.name,
    })),
};

export const postReservationGroupApi = {
    url: `${BASE_PATH}/reservation-group`,
    method: 'POST',
    prepareBody: ({ reservations, ...rest }) => {
        const mappedReservations = reservations.map(r => {
            return {
                courtId: r.courtId,
                from: dayjs(r.from).tz().format(),
                to: dayjs(r.to).tz().format(),
            };
        });
        const fullPayload = {
            ...rest,
            reservations: mappedReservations,
        };
        // console.log('📦 Final payload sent to backend:', fullPayload);
        return fullPayload;
    },
    setFunc: ({ cur, res }) => {
        if (!res?.length)
            return cur;

        let out = [...cur];
        if (res[0].type === RESERVATION_TYPES.DISABLE) {
            out = out.filter(r1 => (
                !res.some(r2 => reservationOverlap(r1, r2))
            ));
        }

        return [
            ...out,
            ...res.map(r => ({
                ...r,
                from: dayjs(r.from).tz(),
                to: dayjs(r.to).tz(),
            })),
        ];
    },
};

export const patchReservationGroupApi = {
    url: `${BASE_PATH}/reservation-group/:groupId`,
    method: 'PATCH',
    setFunc: ({ cur, req, params }) => {
        const groupId = params.path.groupId;
        const reference = cur.find(r => r.groupId === groupId);
        if (!reference)
            return cur;

        let out = [...cur];
        if (reference.type === RESERVATION_TYPES.DISABLE) {
            out = out.filter(r1 => (
                !req.reservations.some(r2 => reservationOverlap(r1, r2))
            ));
        }

        return [
            ...out.filter(r => r.groupId !== groupId),
            ...req.reservations.map(r => ({
                ...reference,
                ...r,
                text: req.text || reference.text,
            }))
        ];
    },
};

// export const deleteReservationGroupApi = {
//     url: `${BASE_PATH}/reservation-group/:groupId`,
//     method: 'DELETE',
//     setFunc: ({ cur, params }) => (
//         cur.filter(r => r.groupId !== params.path.groupId)
//     ),
// };



export const getUsersApi = {
    url: `${BASE_PATH}/users`,
    setFunc: ({ res }) => res.map(user => ({
        ...user,
        lastActivity: user.lastActivity && dayjs(user.lastActivity)
    })),
};

export const patchUserApi = {
    url: `${BASE_PATH}/user/:userId`,
    method: 'PATCH',
    setFunc: ({ cur, req }) => {
        if (Array.isArray(cur)) {
            return cur.map(u => {
                if (u.userId === req.userId)
                    return {
                        ...u,
                        ...req,
                        verified: (!req.mail || u.mail === req.mail)
                            ? u.verified : false,
                    };
                return u;
            });
        } else {
            return {
                ...cur,
                ...req,
                verified: (!req.mail || cur.mail === req.mail)
                    ? cur.verified : false,
            };
        }
    },
};

export const patchUserAdminApi = {
    url: `${BASE_PATH}/users/:userId`,
    method: 'PATCH',
    setFunc: ({ cur, req }) => {
        if (Array.isArray(cur)) {
            return cur.map(u => {
                if (u.userId === req.userId)
                    return {
                        ...u,
                        ...req,
                        verified: (!req.mail || u.mail === req.mail)
                            ? u.verified : false,
                    };
                return u;
            });
        } else {
            return {
                ...cur,
                ...req,
                verified: (!req.mail || cur.mail === req.mail)
                    ? cur.verified : false,
            };
        }
    },
};

export const deleteUserApi = {
    url: `${BASE_PATH}/user/:userId`,
    method: 'DELETE',
    setFunc: ({ cur, params }) => (
        cur.filter(u => u.userId !== params.path.userId)
    ),
};

export const postVerifyMailApi = {
    url: `${BASE_PATH}/verify-mail`,
    method: 'POST',
    setFunc: ({ cur }) => ({
        ...cur,
        verified: true,
    }),
};

export const postSendVerifyMailApi = {
    url: `${BASE_PATH}/send-verify-mail`,
    method: 'POST',
};

export const getTemplatesApi = {
  url: `${BASE_PATH}/templates`,
  setFunc: ({ res }) => {
        console.log("🛠️ getTemplatesApi setFunc called with:", res);
        return res;
    }
};

// export const putTemplateApi = {
//     url: `${BASE_PATH}/template/:id`,
//     method: 'PUT',
//     setFunc: ({ cur, req }) => ({
//         ...cur,
//         [req.id]: req,
//     }),
// };
export const putTemplateApi = {
  url: `${BASE_PATH}/templates/:key`,
  method: 'PUT',
  setFunc: ({ cur, req }) => {
    console.log("🛠️ putTemplateApi setFunc called with:", cur, req);
        return {
            ...cur,
            [req.key]: req,
        };
    }
};

export const getMailTemplatesApi = {
    url: `${BASE_PATH}/mail-templates`,
};

export const putMailTemplateApi = {
    url: `${BASE_PATH}/mail-template/:id`,
    method: 'PUT',
    setFunc: ({ cur, req }) => ({
        ...cur,
        [req.id]: req,
    }),
};
