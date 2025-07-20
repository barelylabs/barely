SELECT
    concat('template_', toString(rand() % 1000)) AS emailTemplateId,
    concat('fan_', toString(rand() % 10000)) AS fanId,
    multiIf(rand() % 3 = 0, NULL, rand() % 3 = 1, concat('action_', toString(rand() % 500)), concat('action_', toString(rand() % 500))) AS flowActionId,
    multiIf(rand() % 3 = 0, NULL, rand() % 3 = 1, concat('flow_', toString(rand() % 300)), concat('flow_', toString(rand() % 300))) AS flowId,
    concat('marketing@', ['example.com', 'company.io', 'brand.co'][rand() % 3 + 1]) AS from,
    concat('res_', toString(rand() % 20000)) AS resendId,
    ['Welcome!', 'Special Offer', 'Newsletter', 'Product Update', 'Invitation'][rand() % 5 + 1] AS subject,
    toDateTime64(now() - rand() % (86400 * 30), 3) AS timestamp,
    concat(toString(rand() % 1000), '@', ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'][rand() % 4 + 1]) AS to,
    ['transactional', 'marketing', 'notification', 'digest'][rand() % 4 + 1] AS type,
    multiIf(rand() % 3 = 0, NULL, rand() % 3 = 1, concat('broadcast_', toString(rand() % 200)), concat('broadcast_', toString(rand() % 200))) AS emailBroadcastId
FROM numbers(10)